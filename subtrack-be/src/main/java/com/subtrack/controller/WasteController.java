package com.subtrack.controller;

import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.WasteAnalysisResponse;
import com.subtrack.service.WasteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/waste")
@RequiredArgsConstructor
public class WasteController {

    private final WasteService wasteService;

    @GetMapping
    public ResponseEntity<ApiResponse<WasteAnalysisResponse>> getWasteAnalysis(
            @AuthenticationPrincipal UserDetails userDetails) {
        WasteAnalysisResponse analysis = wasteService.analyze(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(analysis));
    }
}
