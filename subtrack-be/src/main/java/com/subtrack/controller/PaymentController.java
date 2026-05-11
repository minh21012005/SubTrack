package com.subtrack.controller;

import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.PageResponse;
import com.subtrack.dto.response.PaymentRequestDTO;
import com.subtrack.enums.BillingPeriod;
import com.subtrack.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<PaymentRequestDTO>> createRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        BillingPeriod billingPeriod = BillingPeriod.valueOf(body.getOrDefault("billingPeriod", "MONTHLY"));
        PaymentRequestDTO dto = paymentService.createRequest(userDetails.getUsername(), billingPeriod);
        return ResponseEntity.ok(ApiResponse.<PaymentRequestDTO>builder()
                .success(true)
                .message("Yêu cầu chuyển khoản đã được ghi nhận. Admin sẽ xác nhận trong vòng 24h.")
                .data(dto)
                .timestamp(OffsetDateTime.now())
                .build());
    }

    /**
     * Billing history for upgrades; {@code months} bounds how far back we fetch (default 12 months).
     */
    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<PageResponse<PaymentRequestDTO>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "12") int months) {
        PageResponse<PaymentRequestDTO> data = paymentService.getMyRequestsPage(
                userDetails.getUsername(), page, size, months);
        return ResponseEntity.ok(ApiResponse.<PageResponse<PaymentRequestDTO>>builder()
                .success(true)
                .data(data)
                .timestamp(OffsetDateTime.now())
                .build());
    }
}
