package com.subtrack.scheduler;

import com.subtrack.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseCleanupScheduler {

    private final OtpTokenRepository otpTokenRepository;

    /**
     * Run every day at 1:00 AM server time.
     * Cleans up all OTP tokens that have already expired.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void cleanupExpiredOtpTokens() {
        log.info("Starting scheduled job: Cleaning up expired OTP tokens...");
        
        int deletedCount = otpTokenRepository.deleteExpiredTokens(OffsetDateTime.now());
        
        log.info("Scheduled job completed: Deleted {} expired OTP tokens.", deletedCount);
    }
}
