package com.subtrack.controller;

import com.subtrack.dto.response.AdminUserDTO;
import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.PaymentRequestDTO;
import com.subtrack.service.AdminService;
import com.subtrack.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PaymentService paymentService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.<List<AdminUserDTO>>builder()
                .success(true)
                .data(adminService.getAllUsers())
                .timestamp(OffsetDateTime.now())
                .build());
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentRequestDTO>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.<List<PaymentRequestDTO>>builder()
                .success(true)
                .data(paymentService.getAllRequests())
                .timestamp(OffsetDateTime.now())
                .build());
    }

    @PutMapping("/payments/{id}/approve")
    public ResponseEntity<ApiResponse<PaymentRequestDTO>> approve(
            @PathVariable java.util.UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        PaymentRequestDTO dto = paymentService.approve(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<PaymentRequestDTO>builder()
                .success(true)
                .message("Đã duyệt. Tài khoản được nâng cấp lên Premium.")
                .data(dto)
                .timestamp(OffsetDateTime.now())
                .build());
    }

    @PutMapping("/payments/{id}/reject")
    public ResponseEntity<ApiResponse<PaymentRequestDTO>> reject(
            @PathVariable java.util.UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        PaymentRequestDTO dto = paymentService.reject(id, userDetails.getUsername(), notes);
        return ResponseEntity.ok(ApiResponse.<PaymentRequestDTO>builder()
                .success(true)
                .message("Đã từ chối yêu cầu.")
                .data(dto)
                .timestamp(OffsetDateTime.now())
                .build());
    }
}
