package com.subtrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class WasteAnalysisResponse {
    private BigDecimal totalMonthlyCost;
    private BigDecimal totalWasteCost;
    private BigDecimal potentialSavings;
    private double wastePercentage;

    private List<WasteItemResponse> unusedItems;
    private List<WasteItemResponse> rarelyUsedItems;
    private List<DuplicateCategoryResponse> duplicateCategories;

    private List<SavingSuggestionResponse> suggestions;
}
