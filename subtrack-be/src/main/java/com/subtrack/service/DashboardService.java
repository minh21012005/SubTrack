package com.subtrack.service;

import com.subtrack.dto.response.*;
import com.subtrack.entity.Subscription;
import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.enums.UsageStatus;
import com.subtrack.exception.NotFoundException;
import com.subtrack.repository.SubscriptionRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final WasteEngine wasteEngine;

    @Value("${app.free-subscription-limit:5}")
    private int freeLimit;

    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));

        List<Subscription> allSubs = subscriptionRepository.findByUserIdOrderByNextBillingDateAsc(user.getId());
        List<Subscription> activeSubs = allSubs.stream().filter(s -> !s.isCancelled()).collect(Collectors.toList());
        List<String> duplicateCategories = wasteEngine.findDuplicateCategories(activeSubs);

        // Costs — all normalized to VND for aggregation across mixed currencies
        BigDecimal totalMonthly = activeSubs.stream()
                .map(wasteEngine::toMonthlyVnd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalYearly = totalMonthly.multiply(BigDecimal.valueOf(12)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal totalWaste = activeSubs.stream()
                .map(wasteEngine::calculateWasteVnd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double wastePercent = totalMonthly.compareTo(BigDecimal.ZERO) > 0
                ? totalWaste.divide(totalMonthly, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        // Counts
        long activeCount = activeSubs.stream().filter(s -> s.getUsageStatus() == UsageStatus.ACTIVE).count();
        long wasteCount = activeSubs.stream().filter(s -> s.getUsageStatus() != UsageStatus.ACTIVE).count();
        long cancelledCount = allSubs.stream().filter(Subscription::isCancelled).count();

        // Upcoming charges
        LocalDate now = LocalDate.now();
        List<UpcomingChargeResponse> upcoming7 = buildUpcoming(user.getId(), now, now.plusDays(7));
        List<UpcomingChargeResponse> upcoming30 = buildUpcoming(user.getId(), now, now.plusDays(30));

        // Waste subscriptions
        List<SubscriptionResponse> wasteSubs = activeSubs.stream()
                .filter(s -> s.getUsageStatus() != UsageStatus.ACTIVE)
                .map(s -> toSubResponse(s, duplicateCategories))
                .collect(Collectors.toList());

        // Health Score
        Map<String, Integer> healthBreakdown = new LinkedHashMap<>();
        int wasteDeduction = (int) Math.min(35, wastePercent * 0.35);
        int unusedDeduction = (int) Math.min(25, activeSubs.stream().filter(s -> s.getUsageStatus() == UsageStatus.UNUSED).count() * 10);
        int rarelyDeduction = (int) Math.min(15, activeSubs.stream().filter(s -> s.getUsageStatus() == UsageStatus.RARELY).count() * 5);
        int dupDeduction = Math.min(20, duplicateCategories.size() * 7);
        int healthScore = Math.max(0, 100 - wasteDeduction - unusedDeduction - rarelyDeduction - dupDeduction);
        healthBreakdown.put("L\u00e3ng ph\u00ed chi ti\u00eau", wasteDeduction);
        healthBreakdown.put("Kh\u00f4ng s\u1eed d\u1ee5ng", unusedDeduction);
        healthBreakdown.put("Hi\u1ebfm d\u00f9ng", rarelyDeduction);
        healthBreakdown.put("Tr\u00f9ng l\u1eb7p", dupDeduction);
        String healthLabel = healthScore >= 90 ? "Tuy\u1ec7t v\u1eddi" : healthScore >= 70 ? "\u1ed4n" : "B\u00e1o đ\u1ed9ng";

        return DashboardResponse.builder()
                .totalMonthlyCost(totalMonthly)
                .totalYearlyCost(totalYearly)
                .totalWasteCost(totalWaste)
                .potentialSavings(totalWaste)
                .wastePercentage(Math.round(wastePercent * 10.0) / 10.0)
                .subscriptionCount(allSubs.size())
                .activeCount((int) activeCount)
                .wasteCount((int) wasteCount)
                .cancelledCount((int) cancelledCount)
                .upcomingNext7Days(upcoming7)
                .upcomingNext30Days(upcoming30)
                .duplicateCategories(duplicateCategories)
                .wasteSubscriptions(wasteSubs)
                .isPremium(user.getPlanType() == PlanType.PREMIUM)
                .freeLimit(freeLimit)
                .healthScore(healthScore)
                .healthScoreLabel(healthLabel)
                .healthScoreBreakdown(healthBreakdown)
                .build();
    }

    private List<UpcomingChargeResponse> buildUpcoming(java.util.UUID userId, LocalDate start, LocalDate end) {
        return subscriptionRepository.findUpcoming(userId, start, end).stream()
                .map(s -> {
                    long days = ChronoUnit.DAYS.between(LocalDate.now(), s.getNextBillingDate());
                    return UpcomingChargeResponse.builder()
                            .subscriptionId(s.getId())
                            .name(s.getName())
                            .price(s.getPrice())
                            .currency(s.getCurrency())
                            .billingCycle(s.getBillingCycle())
                            .nextBillingDate(s.getNextBillingDate())
                            .daysUntilRenewal((int) Math.max(0, days))
                            .iconUrl(s.getIconUrl())
                            .color(s.getColor())
                            .category(s.getCategory())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private SubscriptionResponse toSubResponse(Subscription s, List<String> duplicates) {
        boolean isDup = wasteEngine.isPotentialDuplicate(s, duplicates);
        long days = ChronoUnit.DAYS.between(LocalDate.now(), s.getNextBillingDate());
        return SubscriptionResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .price(s.getPrice())
                .currency(s.getCurrency())
                .billingCycle(s.getBillingCycle())
                .nextBillingDate(s.getNextBillingDate())
                .category(s.getCategory())
                .usageStatus(s.getUsageStatus())
                .actionStatus(s.getActionStatus())
                .iconUrl(s.getIconUrl())
                .color(s.getColor())
                .notes(s.getNotes())
                .cancelled(s.isCancelled())
                .monthlyCost(wasteEngine.toMonthly(s.getPrice(), s.getBillingCycle()))
                .wasteCost(wasteEngine.calculateWaste(s))
                .potentialDuplicate(isDup)
                .daysUntilRenewal((int) Math.max(0, days))
                .build();
    }
}
