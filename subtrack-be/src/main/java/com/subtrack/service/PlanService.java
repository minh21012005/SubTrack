package com.subtrack.service;

import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.repository.RenewalReminderRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Centralized service for managing user plan changes.
 * All upgrade/downgrade logic MUST go through this service to ensure
 * data consistency across the users and renewal_reminders tables.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private static final int FREE_REMINDER_DAYS  = 3;
    private static final int PREMIUM_REMINDER_DAYS = 7;

    private final UserRepository userRepository;
    private final RenewalReminderRepository reminderRepository;
    private final NotificationService notificationService;

    /**
     * Upgrade a user to PREMIUM.
     * Sets reminderDaysBefore = 7 and syncs all renewal reminders.
     */
    @Transactional
    public void upgradeToPremium(User user, OffsetDateTime expiresAt) {
        user.setPlanType(PlanType.PREMIUM);
        user.setReminderDaysBefore(PREMIUM_REMINDER_DAYS);
        user.setPlanExpiresAt(expiresAt);
        userRepository.save(user);

        // Bulk update all renewal reminders for this user
        reminderRepository.updateDaysBeforeByUserId(user.getId(), PREMIUM_REMINDER_DAYS);

        log.info("User {} upgraded to PREMIUM. Reminder days set to {}. Expires at {}.",
                user.getEmail(), PREMIUM_REMINDER_DAYS, expiresAt);
    }

    /**
     * Downgrade a user back to FREE.
     * Sets reminderDaysBefore = 3, clears plan expiry, and syncs all renewal reminders.
     */
    @Transactional
    public void downgradeToFree(User user) {
        user.setPlanType(PlanType.FREE);
        user.setReminderDaysBefore(FREE_REMINDER_DAYS);
        user.setPlanExpiresAt(null);
        user.setBillingPeriod(null);
        userRepository.save(user);

        // Bulk update all renewal reminders for this user
        reminderRepository.updateDaysBeforeByUserId(user.getId(), FREE_REMINDER_DAYS);

        // Notify user that their plan has expired
        notificationService.createPlanExpiredNotification(user);

        log.info("User {} downgraded to FREE. Reminder days set to {}.",
                user.getEmail(), FREE_REMINDER_DAYS);
    }
}
