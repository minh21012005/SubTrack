package com.subtrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    // Core shock moment numbers
    private BigDecimal totalMonthlyCost;
    private BigDecimal totalYearlyCost;
    private BigDecimal totalWasteCost;
    private BigDecimal potentialSavings;
    private double wastePercentage;

    // Counts
    private int subscriptionCount;
    private int activeCount;
    private int wasteCount;       // unused + rarely
    private int cancelledCount;

    // Upcoming charges
    private List<UpcomingChargeResponse> upcomingNext7Days;
    private List<UpcomingChargeResponse> upcomingNext30Days;

    // Waste details
    private List<String> duplicateCategories;
    private List<SubscriptionResponse> wasteSubscriptions;

    // Plan info
    private boolean isPremium;
    private int freeLimit;
}
