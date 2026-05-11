package com.subtrack.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminSummaryDTO {
    private long totalUsers;
    private long premiumUsers;
    private long totalActiveSubscriptions;
    private long pendingPaymentRequests;
}
