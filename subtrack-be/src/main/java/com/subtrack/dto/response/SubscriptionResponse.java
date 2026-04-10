package com.subtrack.dto.response;

import com.subtrack.enums.ActionStatus;
import com.subtrack.enums.BillingCycle;
import com.subtrack.enums.UsageStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class SubscriptionResponse {
    private UUID id;
    private String name;
    private BigDecimal price;
    private String currency;
    private BillingCycle billingCycle;
    private LocalDate nextBillingDate;
    private String category;
    private UsageStatus usageStatus;
    private ActionStatus actionStatus;
    private String iconUrl;
    private String color;
    private String notes;
    private boolean cancelled;

    // Computed fields
    private BigDecimal monthlyCost;
    private BigDecimal wasteCost;
    private boolean potentialDuplicate;
    private int daysUntilRenewal;

    // Preset info
    private UUID presetId;
    private String websiteUrl;
}
