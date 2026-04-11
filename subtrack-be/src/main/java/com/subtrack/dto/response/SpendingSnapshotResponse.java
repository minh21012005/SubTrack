package com.subtrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SpendingSnapshotResponse {
    private String monthYear;
    private BigDecimal totalCost;
    private BigDecimal wasteCost;
    private int subscriptionCount;
}
