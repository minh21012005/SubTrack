package com.subtrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DuplicateCategoryResponse {
    private String category;
    private int count;
    private BigDecimal totalMonthlyCost;
    private List<String> subscriptionNames;
}
