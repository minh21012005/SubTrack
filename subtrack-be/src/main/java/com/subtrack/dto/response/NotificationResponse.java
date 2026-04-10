package com.subtrack.dto.response;

import com.subtrack.enums.NotificationStatus;
import com.subtrack.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationResponse {
    private UUID id;
    private String message;
    private NotificationType type;
    private NotificationStatus status;
    private UUID subscriptionId;
    private String subscriptionName;
    private OffsetDateTime createdAt;
}
