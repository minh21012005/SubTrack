package com.subtrack.config;

import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.enums.Role;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL    = "admin@subtrack.com";
    private static final String ADMIN_PASSWORD = "admin";
    private static final String ADMIN_NAME     = "System Admin";

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            // Make sure the existing admin has the right role (in case V4 ran before this)
            userRepository.findByEmail(ADMIN_EMAIL).ifPresent(u -> {
                if (u.getRole() != Role.ADMIN) {
                    u.setRole(Role.ADMIN);
                    u.setPlanType(PlanType.PREMIUM);
                    u.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
                    userRepository.save(u);
                    log.info("Admin account updated with correct role and password.");
                } else {
                    // Ensure password is always correct (fix bad hash from V4)
                    u.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
                    userRepository.save(u);
                    log.info("Admin password re-encoded at startup.");
                }
            });
        } else {
            User admin = User.builder()
                    .email(ADMIN_EMAIL)
                    .name(ADMIN_NAME)
                    .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                    .planType(PlanType.PREMIUM)
                    .role(Role.ADMIN)
                    .reminderDaysBefore(7)
                    .build();
            userRepository.save(admin);
            log.info("Default admin account created: {}", ADMIN_EMAIL);
        }
    }
}
