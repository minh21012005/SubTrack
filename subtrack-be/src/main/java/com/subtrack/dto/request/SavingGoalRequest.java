package com.subtrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SavingGoalRequest {
    @NotBlank(message = "Tên mục tiêu không được để trống")
    private String name;

    @Positive(message = "Số tiền đích phải lớn hơn 0")
    private BigDecimal targetAmount;
}
