package com.subtrack.dto.request;

import com.subtrack.enums.BillingCycle;
import com.subtrack.enums.UsageStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AddSubscriptionRequest {

    /** Nếu chọn từ preset thì truyền presetId, các field khác sẽ được auto-fill */
    private UUID presetId;

    @NotBlank(message = "Tên subscription không được để trống")
    private String name;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    private String currency = "VND";

    @NotNull(message = "Chu kỳ thanh toán không được để trống")
    private BillingCycle billingCycle;

    @NotNull(message = "Ngày thanh toán tiếp theo không được để trống")
    private LocalDate nextBillingDate;

    @NotBlank(message = "Danh mục không được để trống")
    private String category;

    private UsageStatus usageStatus = UsageStatus.ACTIVE;

    private String iconUrl;
    private String color;
    private String notes;
}
