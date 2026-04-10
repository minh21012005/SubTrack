package com.subtrack.dto.response;

import com.subtrack.enums.BillingPeriod;
import com.subtrack.enums.PaymentRequestStatus;
import com.subtrack.enums.PlanType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentRequestDTO {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String transferContent;   // what user should write in the transfer note
    private PlanType planType;
    private BillingPeriod billingPeriod;
    private BigDecimal amount;
    private PaymentRequestStatus status;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime verifiedAt;
    private String verifiedByName;
}
