package com.subtrack.controller;

import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.PresetResponse;
import com.subtrack.service.PresetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presets")
@RequiredArgsConstructor
public class PresetController {

    private final PresetService presetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PresetResponse>>> getAll(
            @RequestParam(required = false) String category) {
        List<PresetResponse> presets = category != null
                ? presetService.getByCategory(category)
                : presetService.getAllPresets();
        return ResponseEntity.ok(ApiResponse.ok(presets));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(presetService.getCategories()));
    }
}
