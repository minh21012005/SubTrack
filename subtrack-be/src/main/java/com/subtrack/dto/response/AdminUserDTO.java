package com.subtrack.dto.response;

import com.subtrack.enums.PlanType;
import com.subtrack.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminUserDTO {
    private UUID id;
    private String email;
    private String name;
    private PlanType planType;
    private Role role;
    private long activeSubscriptions;
    private BigDecimal totalMonthlySpend;
    private OffsetDateTime createdAt;
}
