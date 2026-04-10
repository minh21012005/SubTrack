package com.subtrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class SavingSuggestionResponse {
    private UUID subscriptionId;
    private String name;
    private String reason;
    private BigDecimal monthlySaving;
    private String action; // "CANCEL" | "DOWNGRADE"
    private String iconUrl;
    private String color;
}
