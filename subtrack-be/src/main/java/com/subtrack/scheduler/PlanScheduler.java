package com.subtrack.scheduler;

import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.repository.UserRepository;
import com.subtrack.service.PlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PlanScheduler {

    private final UserRepository userRepository;
    private final PlanService planService;

    /**
     * Runs every day at 1:00 AM to check for expired Premium plans
     * and automatically downgrade them to Free.
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void checkExpiredPlans() {
        log.info("Running expired plan check scheduler at {}", OffsetDateTime.now());

        OffsetDateTime now = OffsetDateTime.now();
        List<User> expiredUsers = userRepository.findAllByPlanTypeAndPlanExpiresAtBefore(PlanType.PREMIUM, now);

        if (expiredUsers.isEmpty()) {
            log.info("No expired Premium plans found.");
            return;
        }

        log.info("Found {} expired Premium plans. Downgrading to Free...", expiredUsers.size());
        
        for (User user : expiredUsers) {
            try {
                planService.downgradeToFree(user);
                log.info("Successfully downgraded user {} to FREE.", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to downgrade user {}: {}", user.getEmail(), e.getMessage());
            }
        }

        log.info("Expired plan check complete.");
    }
}
