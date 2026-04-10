package com.subtrack.service;

import com.subtrack.dto.request.LoginRequest;
import com.subtrack.dto.request.RegisterRequest;
import com.subtrack.dto.request.ChangePasswordRequest;
import com.subtrack.dto.response.AuthResponse;
import com.subtrack.dto.response.UserResponse;
import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.exception.BadRequestException;
import com.subtrack.dto.request.OtpRequest;
import com.subtrack.entity.OtpToken;
import com.subtrack.repository.OtpTokenRepository;
import com.subtrack.entity.RefreshToken;
import com.subtrack.repository.RefreshTokenRepository;
import com.subtrack.exception.ConflictException;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long jwtRefreshExpiration;

    @Transactional
    public void sendOtp(OtpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã được sử dụng: " + request.getEmail());
        }

        // Spam Protection: Tối đa 3 lần / 5 phút
        int recentSends = otpTokenRepository.countByEmailAndCreatedAtAfter(
                request.getEmail(), 
                java.time.OffsetDateTime.now().minusMinutes(5)
        );

        if (recentSends >= 3) {
            throw new BadRequestException("Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau 5 phút.");
        }

        // Generate 6 digit OTP
        String otpCode = String.format("%06d", new java.util.Random().nextInt(999999));

        OtpToken otpToken = OtpToken.builder()
                .email(request.getEmail())
                .otp(otpCode)
                .expiresAt(java.time.OffsetDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmailAsync(request.getEmail(), otpCode);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã được sử dụng: " + request.getEmail());
        }

        // Verify OTP
        OtpToken otpToken = otpTokenRepository.findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Chưa gửi OTP cho email này"));

        if (otpToken.isUsed()) {
            throw new BadRequestException("Mã OTP này đã được sử dụng");
        }

        if (otpToken.getExpiresAt().isBefore(java.time.OffsetDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn");
        }

        if (!otpToken.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Mã OTP không chính xác");
        }

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .planType(PlanType.FREE)
                .reminderDaysBefore(3)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), user.getPasswordHash(), java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                )
        );

        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Email hoặc mật khẩu không đúng");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));

        String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), user.getPasswordHash(), java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                )
        );

        // Xóa refresh token cũ và tạo mới để xoay vòng
        refreshTokenRepository.deleteByUser(user);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
        return toUserResponse(user);
    }

    @Transactional
    public String createRefreshToken(User user) {
        String token = java.util.UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(java.time.OffsetDateTime.now().plusSeconds(jwtRefreshExpiration / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Transactional
    public AuthResponse refreshAccessToken(String requestRefreshToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ hoặc đã đăng xuất."));

        if (refreshToken.getExpiryDate().isBefore(java.time.OffsetDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }

        User user = refreshToken.getUser();
        String newToken = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), user.getPasswordHash(), java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                )
        );
        
        // Rotate refresh token
        refreshTokenRepository.delete(refreshToken);
        String newRefreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .token(newToken)
                .tokenType("Bearer")
                .refreshToken(newRefreshToken)
                .user(toUserResponse(user))
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenRepository.deleteByToken(refreshToken);
        }
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu cũ không chính xác");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .planType(user.getPlanType())
                .billingPeriod(user.getBillingPeriod())
                .planExpiresAt(user.getPlanExpiresAt())
                .role(user.getRole())
                .reminderDaysBefore(user.getReminderDaysBefore())
                .build();
    }
}
