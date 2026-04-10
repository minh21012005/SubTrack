package com.subtrack.controller;

import com.subtrack.dto.response.AdminUserDTO;
import com.subtrack.dto.response.ApiResponse;
import com.subtrack.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.<List<AdminUserDTO>>builder()
                .success(true)
                .data(adminService.getAllUsers())
                .timestamp(OffsetDateTime.now())
                .build());
    }
}
