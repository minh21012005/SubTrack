package com.subtrack.dto.response;

import com.subtrack.enums.BillingCycle;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class UpcomingChargeResponse {
    private UUID subscriptionId;
    private String name;
    private BigDecimal price;
    private String currency;
    private BillingCycle billingCycle;
    private LocalDate nextBillingDate;
    private int daysUntilRenewal;
    private String iconUrl;
    private String color;
    private String category;
}
