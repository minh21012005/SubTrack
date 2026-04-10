package com.subtrack.controller;

import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.PaymentRequestDTO;
import com.subtrack.enums.BillingPeriod;
import com.subtrack.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
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

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<PaymentRequestDTO>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<PaymentRequestDTO> list = paymentService.getMyRequests(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<List<PaymentRequestDTO>>builder()
                .success(true)
                .data(list)
                .timestamp(OffsetDateTime.now())
                .build());
    }
}
