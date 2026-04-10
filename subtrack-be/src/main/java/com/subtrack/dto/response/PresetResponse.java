package com.subtrack.dto.response;

import com.subtrack.enums.BillingCycle;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PresetResponse {
    private UUID id;
    private String name;
    private String category;
    private BigDecimal defaultPrice;
    private String currency;
    private BillingCycle billingCycle;
    private String iconUrl;
    private String color;
    private String websiteUrl;
    private String description;
    private boolean vnService;
}
