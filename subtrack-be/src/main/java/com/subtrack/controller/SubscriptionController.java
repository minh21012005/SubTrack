package com.subtrack.controller;

import com.subtrack.dto.request.AddSubscriptionRequest;
import com.subtrack.dto.request.SubscriptionActionRequest;
import com.subtrack.dto.request.UpdateSubscriptionRequest;
import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.SubscriptionResponse;
import com.subtrack.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SubscriptionResponse> subs = subscriptionService.getUserSubscriptions(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(subs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getOne(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        SubscriptionResponse sub = subscriptionService.getSubscription(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(sub));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionResponse>> add(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddSubscriptionRequest request) {
        SubscriptionResponse sub = subscriptionService.addSubscription(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Thêm subscription thành công", sub));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody UpdateSubscriptionRequest request) {
        SubscriptionResponse sub = subscriptionService.updateSubscription(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", sub));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        subscriptionService.deleteSubscription(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa subscription thành công", null));
    }

    @PutMapping("/{id}/action")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> performAction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionActionRequest request) {
        SubscriptionResponse sub = subscriptionService.performAction(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật action thành công", sub));
    }
}
