package com.subtrack.scheduler;

import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.repository.RenewalReminderRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionScheduler {

    private final UserRepository userRepository;
    private final RenewalReminderRepository renewalReminderRepository;

    /**
     * Runs every hour to check for expired subscriptions.
     * Reverts PREMIUM users to FREE if their planExpiresAt has passed.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkExpiredSubscriptions() {
        OffsetDateTime now = OffsetDateTime.now();
        log.info("Checking for expired subscriptions at {}", now);

        List<User> expiredUsers = userRepository.findAllByPlanTypeAndPlanExpiresAtBefore(
                PlanType.PREMIUM, now
        );

        if (!expiredUsers.isEmpty()) {
            log.info("Found {} expired Premium accounts. Reverting to FREE.", expiredUsers.size());
            
            for (User user : expiredUsers) {
                log.info("User {} (ID: {}) subscription expired at {}. Reverting to FREE.", 
                        user.getEmail(), user.getId(), user.getPlanExpiresAt());
                
                user.setPlanType(PlanType.FREE);
                user.setPlanExpiresAt(null);
                user.setBillingPeriod(null);
                user.setReminderDaysBefore(3);

                user.getSubscriptions().forEach(sub -> {
                    renewalReminderRepository.findBySubscriptionId(sub.getId()).ifPresent(reminder -> {
                        reminder.setDaysBefore(3);
                        renewalReminderRepository.save(reminder);
                    });
                });
            }
            
            userRepository.saveAll(expiredUsers);
            log.info("Successfully updated {} users back to FREE plan.", expiredUsers.size());
        }
    }
}
