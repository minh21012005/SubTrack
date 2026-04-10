package com.subtrack.dto.request;

import com.subtrack.enums.ActionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionActionRequest {
    @NotNull(message = "Action không được để trống")
    private ActionType actionType;

    private String note;
}
