package com.subtrack.controller;

import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.DashboardResponse;
import com.subtrack.dto.response.SpendingSnapshotResponse;
import com.subtrack.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        DashboardResponse dashboard = dashboardService.getDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }

    @GetMapping("/spending-trend")
    public ResponseEntity<ApiResponse<List<SpendingSnapshotResponse>>> getSpendingTrend(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSpendingTrend(userDetails.getUsername())));
    }
}
