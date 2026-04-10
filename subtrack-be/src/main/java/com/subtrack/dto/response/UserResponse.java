package com.subtrack.dto.response;

import com.subtrack.enums.PlanType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private PlanType planType;
    private Integer reminderDaysBefore;
}
