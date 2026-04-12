package com.subtrack.service;

import com.subtrack.dto.response.*;
import com.subtrack.entity.Subscription;
import com.subtrack.entity.User;
import com.subtrack.enums.UsageStatus;
import com.subtrack.exception.NotFoundException;
import com.subtrack.repository.SubscriptionRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WasteService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final WasteEngine wasteEngine;

    public WasteAnalysisResponse analyze(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));

        List<Subscription> activeSubs = subscriptionRepository
                .findByUserIdAndCancelledFalseOrderByNextBillingDateAsc(user.getId());

        java.util.Set<java.util.UUID> duplicateIds = wasteEngine.findDuplicateSubscriptionIds(activeSubs);
        List<String> duplicateCategories = wasteEngine.findDuplicateCategories(activeSubs);

        // All totals normalized to VND for cross-currency comparison
        BigDecimal totalMonthly = activeSubs.stream()
                .map(wasteEngine::toMonthlyVnd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWaste = activeSubs.stream()
                .map(wasteEngine::calculateWasteVnd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double wastePercent = totalMonthly.compareTo(BigDecimal.ZERO) > 0
                ? totalWaste.divide(totalMonthly, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        List<WasteItemResponse> unusedItems = buildWasteItems(activeSubs, UsageStatus.UNUSED, duplicateIds, duplicateCategories);
        List<WasteItemResponse> rarelyItems = buildWasteItems(activeSubs, UsageStatus.RARELY, duplicateIds, duplicateCategories);

        List<DuplicateCategoryResponse> dupSummary = wasteEngine.buildDuplicateSummary(activeSubs);
        List<SavingSuggestionResponse> suggestions = wasteEngine.buildSuggestions(activeSubs);

        return WasteAnalysisResponse.builder()
                .totalMonthlyCost(totalMonthly)
                .totalWasteCost(totalWaste)
                .potentialSavings(totalWaste)
                .wastePercentage(Math.round(wastePercent * 10.0) / 10.0)
                .unusedItems(unusedItems)
                .rarelyUsedItems(rarelyItems)
                .duplicateCategories(dupSummary)
                .suggestions(suggestions)
                .build();
    }

    private List<WasteItemResponse> buildWasteItems(List<Subscription> subs, UsageStatus status,
                                                     java.util.Set<java.util.UUID> duplicateIds,
                                                     List<String> duplicates) {
        return subs.stream()
                .filter(s -> s.getUsageStatus() == status)
                .map(s -> {
                    // Per-item costs in VND for consistent display on waste page
                    BigDecimal monthlyVnd = wasteEngine.toMonthlyVnd(s);
                    BigDecimal wasteVnd = wasteEngine.calculateWasteVnd(s);
                    boolean isDup = wasteEngine.isPotentialDuplicate(s, duplicateIds, duplicates);
                    return WasteItemResponse.builder()
                            .subscriptionId(s.getId())
                            .name(s.getName())
                            .category(s.getCategory())
                            .monthlyCost(monthlyVnd)
                            .wasteCost(wasteVnd)
                            .wastePercentage(wasteEngine.getWastePercentage(s))
                            .usageStatus(s.getUsageStatus())
                            .iconUrl(s.getIconUrl())
                            .color(s.getColor())
                            .reason(wasteEngine.getWasteReason(s, isDup))
                            .build();
                })
                .collect(Collectors.toList());
    }
}
