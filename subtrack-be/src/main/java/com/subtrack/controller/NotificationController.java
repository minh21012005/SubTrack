package com.subtrack.controller;

import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.NotificationResponse;
import com.subtrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<NotificationResponse> notifs = notificationService.getUserNotifications(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(notifs));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        notificationService.markAsRead(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đã đọc notification", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Đã đánh dấu tất cả đã đọc", null));
    }
}
