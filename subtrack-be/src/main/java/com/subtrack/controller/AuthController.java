package com.subtrack.controller;

import com.subtrack.dto.request.LoginRequest;
import com.subtrack.dto.request.RegisterRequest;
import com.subtrack.dto.request.ChangePasswordRequest;
import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.AuthResponse;
import com.subtrack.dto.response.UserResponse;
import com.subtrack.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody com.subtrack.dto.request.OtpRequest request) {
        authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("Mã xác thực đã được gửi đến email", null));
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken, long maxAgeSecs) {
        return ResponseCookie.from("subtrack_refresh", refreshToken)
                .httpOnly(true)
                .secure(false) // in Dev this is false, usually true in Prod if HTTPS
                .path("/")
                .maxAge(maxAgeSecs)
                .sameSite("Lax")
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        
        ResponseCookie cookie = createRefreshTokenCookie(response.getRefreshToken(), 7 * 24 * 60 * 60);
        response.setRefreshToken(null); // Không gửi qua JSON

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok("Đăng ký thành công", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        
        ResponseCookie cookie = createRefreshTokenCookie(response.getRefreshToken(), 7 * 24 * 60 * 60);
        response.setRefreshToken(null); // Không gửi qua JSON

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@CookieValue(name = "subtrack_refresh", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Không tìm thấy token làm mới"));
        }

        AuthResponse response = authService.refreshAccessToken(refreshToken);
        
        ResponseCookie cookie = createRefreshTokenCookie(response.getRefreshToken(), 7 * 24 * 60 * 60);
        response.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok("Làm mới token thành công", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "subtrack_refresh", required = false) String refreshToken) {
        
        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }
        
        ResponseCookie clearCookie = createRefreshTokenCookie("", 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(ApiResponse.ok("Đăng xuất thành công", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }
}
