package com.subtrack.dto.request;

import com.subtrack.enums.BillingCycle;
import com.subtrack.enums.UsageStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateSubscriptionRequest {
    private String name;

    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    private String currency;
    private BillingCycle billingCycle;
    private LocalDate nextBillingDate;
    private String category;
    private UsageStatus usageStatus;
    private String iconUrl;
    private String color;
    private String notes;

    @Pattern(
        regexp = "^$|^https?://.*",
        message = "Website URL phải bắt đầu bằng http:// hoặc https://"
    )
    private String websiteUrl;
}
