package com.subtrack.service;

import com.subtrack.entity.Subscription;
import com.subtrack.enums.BillingCycle;
import com.subtrack.enums.UsageStatus;
import com.subtrack.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WasteEngine {

    private final CurrencyConverter currencyConverter;

    /**
     * Convert a subscription price to its monthly equivalent (same currency).
     * Use this for per-subscription display.
     */
    public BigDecimal toMonthly(BigDecimal price, BillingCycle cycle) {
        return switch (cycle) {
            case WEEKLY -> price.multiply(BigDecimal.valueOf(4.33)).setScale(2, RoundingMode.HALF_UP);
            case MONTHLY -> price.setScale(2, RoundingMode.HALF_UP);
            case QUARTERLY -> price.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
            case YEARLY -> price.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        };
    }

    /**
     * Calculate the waste cost for a single subscription.
     * Rule 1: UNUSED → 100% waste
     * Rule 2: RARELY → 50% waste
     * Rule 3: ACTIVE → no waste
     * CANCELLED → excluded entirely
     */
    public BigDecimal calculateWaste(Subscription sub) {
        if (sub.isCancelled()) return BigDecimal.ZERO;
        BigDecimal monthly = toMonthly(sub.getPrice(), sub.getBillingCycle());
        return switch (sub.getUsageStatus()) {
            case UNUSED -> monthly;
            case RARELY -> monthly.multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP);
            case ACTIVE -> BigDecimal.ZERO;
        };
    }

    /**
     * Find categories that have more than one active subscription (potential duplicates).
     */
    public List<String> findDuplicateCategories(List<Subscription> subs) {
        return subs.stream()
                .filter(s -> !s.isCancelled())
                .collect(Collectors.groupingBy(Subscription::getCategory, Collectors.counting()))
                .entrySet().stream()
                .filter(e -> e.getValue() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Check if a subscription belongs to a duplicate category.
     */
    public boolean isPotentialDuplicate(Subscription sub, List<String> duplicateCategories) {
        return !sub.isCancelled() && duplicateCategories.contains(sub.getCategory());
    }

    /**
     * Get the waste percentage for a subscription (0-100).
     */
    public double getWastePercentage(Subscription sub) {
        if (sub.isCancelled()) return 0.0;
        return switch (sub.getUsageStatus()) {
            case UNUSED -> 100.0;
            case RARELY -> 50.0;
            case ACTIVE -> 0.0;
        };
    }

    /**
     * Get reason string for why a subscription is considered waste.
     */
    public String getWasteReason(Subscription sub, boolean isDuplicate) {
        return switch (sub.getUsageStatus()) {
            case UNUSED -> "Không sử dụng — 100% lãng phí";
            case RARELY -> "Hiếm khi sử dụng — 50% lãng phí";
            case ACTIVE -> isDuplicate ? "Danh mục trùng với subscription khác" : "";
        };
    }

    /**
     * Build saving suggestions from waste subscriptions.
     */
    public List<SavingSuggestionResponse> buildSuggestions(List<Subscription> wasteSubs) {
        return wasteSubs.stream()
                .filter(s -> !s.isCancelled())
                .filter(s -> s.getUsageStatus() != UsageStatus.ACTIVE)
                .map(s -> {
                    BigDecimal monthly = toMonthly(s.getPrice(), s.getBillingCycle());
                    BigDecimal waste = calculateWaste(s);
                    String reason = s.getUsageStatus() == UsageStatus.UNUSED
                            ? "Bạn không sử dụng dịch vụ này"
                            : "Bạn hiếm khi sử dụng dịch vụ này";
                    return SavingSuggestionResponse.builder()
                            .subscriptionId(s.getId())
                            .name(s.getName())
                            .reason(reason)
                            .monthlySaving(waste)
                            .action("CANCEL")
                            .iconUrl(s.getIconUrl())
                            .color(s.getColor())
                            .build();
                })
                .sorted((a, b) -> b.getMonthlySaving().compareTo(a.getMonthlySaving()))
                .collect(Collectors.toList());
    }

    /**
     * Build duplicate category summaries.
     */
    public List<DuplicateCategoryResponse> buildDuplicateSummary(List<Subscription> activeSubs) {
        return activeSubs.stream()
                .filter(s -> !s.isCancelled())
                .collect(Collectors.groupingBy(Subscription::getCategory))
                .entrySet().stream()
                .filter(e -> e.getValue().size() > 1)
                .map(e -> {
                    List<Subscription> group = e.getValue();
                    BigDecimal totalCost = group.stream()
                            .map(s -> toMonthly(s.getPrice(), s.getBillingCycle()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    List<String> names = group.stream().map(Subscription::getName).collect(Collectors.toList());
                    return DuplicateCategoryResponse.builder()
                            .category(e.getKey())
                            .count(group.size())
                            .totalMonthlyCost(totalCost)
                            .subscriptionNames(names)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Convert a subscription's monthly cost to VND for aggregation.
     * Use this when summing costs across subscriptions with mixed currencies.
     */
    public BigDecimal toMonthlyVnd(Subscription sub) {
        BigDecimal monthly = toMonthly(sub.getPrice(), sub.getBillingCycle());
        return currencyConverter.toVnd(monthly, sub.getCurrency());
    }

    /**
     * Calculate the waste cost in VND for aggregation purposes.
     */
    public BigDecimal calculateWasteVnd(Subscription sub) {
        if (sub.isCancelled()) return BigDecimal.ZERO;
        BigDecimal monthlyVnd = toMonthlyVnd(sub);
        return switch (sub.getUsageStatus()) {
            case UNUSED -> monthlyVnd;
            case RARELY -> monthlyVnd.multiply(BigDecimal.valueOf(0.5)).setScale(0, RoundingMode.HALF_UP);
            case ACTIVE -> BigDecimal.ZERO;
        };
    }
}
