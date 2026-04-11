package com.subtrack.service;

import com.subtrack.dto.request.AddSubscriptionRequest;
import com.subtrack.dto.request.SubscriptionActionRequest;
import com.subtrack.dto.request.UpdateSubscriptionRequest;
import com.subtrack.dto.response.SubscriptionResponse;
import com.subtrack.entity.*;
import com.subtrack.enums.ActionStatus;
import com.subtrack.enums.ActionType;
import com.subtrack.enums.PlanType;
import com.subtrack.enums.UsageStatus;
import com.subtrack.exception.BadRequestException;
import com.subtrack.exception.ForbiddenException;
import com.subtrack.exception.NotFoundException;
import com.subtrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final ServicePresetRepository presetRepository;
    private final UserActionRepository userActionRepository;
    private final RenewalReminderRepository reminderRepository;
    private final WasteEngine wasteEngine;

    @Value("${app.free-subscription-limit:5}")
    private int freeLimit;

    public List<SubscriptionResponse> getUserSubscriptions(String email) {
        User user = getUser(email);
        List<Subscription> subs = subscriptionRepository.findByUserIdOrderByNextBillingDateAsc(user.getId());
        List<String> duplicateCategories = wasteEngine.findDuplicateCategories(subs);
        return subs.stream()
                .map(s -> toResponse(s, duplicateCategories))
                .collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionResponse addSubscription(String email, AddSubscriptionRequest request) {
        User user = getUser(email);

        // Free plan limit check
        if (user.getPlanType() == PlanType.FREE) {
            long count = subscriptionRepository.countByUserIdAndCancelledFalse(user.getId());
            if (count >= freeLimit) {
                throw new BadRequestException(
                        "Tài khoản Free chỉ được thêm tối đa " + freeLimit + " subscription. " +
                        "Nâng cấp lên Premium để thêm không giới hạn!"
                );
            }
        }

        ServicePreset preset = null;
        if (request.getPresetId() != null) {
            preset = presetRepository.findById(request.getPresetId()).orElse(null);
        }

        Subscription sub = Subscription.builder()
                .user(user)
                .preset(preset)
                .name(request.getName())
                .price(request.getPrice())
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .billingCycle(request.getBillingCycle())
                .nextBillingDate(request.getNextBillingDate())
                .category(request.getCategory())
                .usageStatus(request.getUsageStatus() != null ? request.getUsageStatus() : UsageStatus.ACTIVE)
                .actionStatus(ActionStatus.NONE)
                .iconUrl(request.getIconUrl() != null ? request.getIconUrl() : (preset != null ? preset.getIconUrl() : null))
                .color(request.getColor() != null ? request.getColor() : (preset != null ? preset.getColor() : null))
                .notes(request.getNotes())
                .websiteUrl(request.getWebsiteUrl())
                .cancelled(false)
                .build();

        subscriptionRepository.save(sub);

        // Auto-create a renewal reminder using user preference
        RenewalReminder reminder = RenewalReminder.builder()
                .subscription(sub)
                .daysBefore(user.getReminderDaysBefore())
                .active(true)
                .build();
        reminderRepository.save(reminder);

        List<String> duplicates = wasteEngine.findDuplicateCategories(
                subscriptionRepository.findByUserIdAndCancelledFalseOrderByNextBillingDateAsc(user.getId())
        );
        return toResponse(sub, duplicates);
    }

    @Transactional
    public SubscriptionResponse updateSubscription(String email, UUID subId, UpdateSubscriptionRequest request) {
        User user = getUser(email);
        Subscription sub = getSubscriptionForUser(subId, user.getId());

        if (request.getName() != null) sub.setName(request.getName());
        if (request.getPrice() != null) sub.setPrice(request.getPrice());
        if (request.getCurrency() != null) sub.setCurrency(request.getCurrency());
        if (request.getBillingCycle() != null) sub.setBillingCycle(request.getBillingCycle());
        if (request.getNextBillingDate() != null) sub.setNextBillingDate(request.getNextBillingDate());
        if (request.getCategory() != null) sub.setCategory(request.getCategory());
        if (request.getUsageStatus() != null) sub.setUsageStatus(request.getUsageStatus());
        if (request.getIconUrl() != null) sub.setIconUrl(request.getIconUrl());
        if (request.getColor() != null) sub.setColor(request.getColor());
        if (request.getNotes() != null) sub.setNotes(request.getNotes());
        if (request.getWebsiteUrl() != null) sub.setWebsiteUrl(request.getWebsiteUrl());

        subscriptionRepository.save(sub);

        List<String> duplicates = wasteEngine.findDuplicateCategories(
                subscriptionRepository.findByUserIdAndCancelledFalseOrderByNextBillingDateAsc(user.getId())
        );
        return toResponse(sub, duplicates);
    }

    @Transactional
    public void deleteSubscription(String email, UUID subId) {
        User user = getUser(email);
        Subscription sub = getSubscriptionForUser(subId, user.getId());
        subscriptionRepository.delete(sub);
    }

    @Transactional
    public SubscriptionResponse performAction(String email, UUID subId, SubscriptionActionRequest request) {
        User user = getUser(email);
        Subscription sub = getSubscriptionForUser(subId, user.getId());

        switch (request.getActionType()) {
            case KEEP -> {
                sub.setActionStatus(ActionStatus.KEEP);
                sub.setUsageStatus(UsageStatus.ACTIVE);
                sub.setCancelled(false);
            }
            case CANCEL -> {
                sub.setActionStatus(ActionStatus.CANCEL);
                sub.setCancelled(true);
            }
            case MARK_RARELY -> {
                sub.setUsageStatus(UsageStatus.RARELY);
                sub.setActionStatus(ActionStatus.NONE);
            }
            case MARK_UNUSED -> {
                sub.setUsageStatus(UsageStatus.UNUSED);
                sub.setActionStatus(ActionStatus.NONE);
            }
            case MARK_ACTIVE -> {
                sub.setUsageStatus(UsageStatus.ACTIVE);
                sub.setActionStatus(ActionStatus.NONE);
                sub.setCancelled(false);
            }
        }

        subscriptionRepository.save(sub);

        // Log action
        userActionRepository.save(UserAction.builder()
                .user(user)
                .subscription(sub)
                .actionType(request.getActionType())
                .note(request.getNote())
                .build());

        List<String> duplicates = wasteEngine.findDuplicateCategories(
                subscriptionRepository.findByUserIdAndCancelledFalseOrderByNextBillingDateAsc(user.getId())
        );
        return toResponse(sub, duplicates);
    }

    public SubscriptionResponse getSubscription(String email, UUID subId) {
        User user = getUser(email);
        Subscription sub = getSubscriptionForUser(subId, user.getId());
        List<String> duplicates = wasteEngine.findDuplicateCategories(
                subscriptionRepository.findByUserIdAndCancelledFalseOrderByNextBillingDateAsc(user.getId())
        );
        return toResponse(sub, duplicates);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));
    }

    private Subscription getSubscriptionForUser(UUID subId, UUID userId) {
        Subscription sub = subscriptionRepository.findById(subId)
                .orElseThrow(() -> new NotFoundException("Subscription không tồn tại"));
        if (!sub.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Không có quyền truy cập subscription này");
        }
        return sub;
    }

    private SubscriptionResponse toResponse(Subscription sub, List<String> duplicateCategories) {
        boolean isDuplicate = wasteEngine.isPotentialDuplicate(sub, duplicateCategories);
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), sub.getNextBillingDate());

        // Ưu tiên websiteUrl trực tiếp trên subscription, sau đó mới đến preset
        String websiteUrl = sub.getWebsiteUrl();
        UUID presetId = null;
        if (sub.getPreset() != null) {
            presetId = sub.getPreset().getId();
            if (websiteUrl == null) {
                websiteUrl = sub.getPreset().getWebsiteUrl();
            }
        }

        return SubscriptionResponse.builder()
                .id(sub.getId())
                .name(sub.getName())
                .price(sub.getPrice())
                .currency(sub.getCurrency())
                .billingCycle(sub.getBillingCycle())
                .nextBillingDate(sub.getNextBillingDate())
                .category(sub.getCategory())
                .usageStatus(sub.getUsageStatus())
                .actionStatus(sub.getActionStatus())
                .iconUrl(sub.getIconUrl())
                .color(sub.getColor())
                .notes(sub.getNotes())
                .cancelled(sub.isCancelled())
                .monthlyCost(wasteEngine.toMonthly(sub.getPrice(), sub.getBillingCycle()))
                .wasteCost(wasteEngine.calculateWaste(sub))
                .potentialDuplicate(isDuplicate)
                .daysUntilRenewal((int) Math.max(0, daysUntil))
                .presetId(presetId)
                .websiteUrl(websiteUrl)
                .build();
    }
}
