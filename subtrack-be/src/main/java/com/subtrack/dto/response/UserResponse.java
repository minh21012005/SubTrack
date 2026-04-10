package com.subtrack.dto.response;

import com.subtrack.enums.PlanType;
import com.subtrack.enums.Role;
import com.subtrack.enums.BillingPeriod;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private PlanType planType;
    private BillingPeriod billingPeriod;
    private OffsetDateTime planExpiresAt;
    private Role role;
    private Integer reminderDaysBefore;
}
