package com.subtrack.dto.response;

import com.subtrack.enums.UsageStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class WasteItemResponse {
    private UUID subscriptionId;
    private String name;
    private String category;
    private BigDecimal monthlyCost;
    private BigDecimal wasteCost;
    private double wastePercentage;
    private UsageStatus usageStatus;
    private String iconUrl;
    private String color;
    private String reason;
}
