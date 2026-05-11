package com.subtrack.controller;

import com.subtrack.dto.response.AdminSummaryDTO;
import com.subtrack.dto.response.AdminUserDTO;
import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.PageResponse;
import com.subtrack.dto.response.PaymentRequestDTO;
import com.subtrack.service.AdminService;
import com.subtrack.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PaymentService paymentService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminSummaryDTO>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getSummary()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserDTO>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUsersPage(search, page, size)));
    }

    @GetMapping("/payments/pending")
    public ResponseEntity<ApiResponse<PageResponse<PaymentRequestDTO>>> getPendingPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPendingRequestsPage(page, size)));
    }

    /**
     * Processed top-up requests (approved/rejected). {@code months} limits how far back we load (default 12 months).
     */
    @GetMapping("/payments/history")
    public ResponseEntity<ApiResponse<PageResponse<PaymentRequestDTO>>> getPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getProcessedHistoryPage(page, size, months)));
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
