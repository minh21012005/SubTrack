package com.subtrack.scheduler;

import com.subtrack.entity.RenewalReminder;
import com.subtrack.repository.RenewalReminderRepository;
import com.subtrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RenewalScheduler {

    private final RenewalReminderRepository reminderRepository;
    private final NotificationService notificationService;

    @Value("${app.reminder.cron:0 0 8 * * *}")
    private String cron;

    /**
     * Runs every day at 8:00 AM.
     * Checks for subscriptions due for renewal in X days and creates notifications.
     */
    @Scheduled(cron = "${app.reminder.cron:0 0 8 * * *}")
    @Transactional
    public void checkRenewals() {
        log.info("Running renewal check scheduler at {}", LocalDate.now());
        int notificationsCreated = 0;

        // Check reminders for subscriptions due tomorrow through 7 days buffer
        for (int daysAhead = 1; daysAhead <= 14; daysAhead++) {
            LocalDate targetDate = LocalDate.now().plusDays(daysAhead);
            List<RenewalReminder> dueReminders = reminderRepository.findDueReminders(targetDate);

            for (RenewalReminder reminder : dueReminders) {
                if (reminder.getDaysBefore() == daysAhead) {
                    try {
                        notificationService.createRenewalNotification(
                                reminder.getSubscription().getUser(),
                                reminder.getSubscription()
                        );
                        notificationsCreated++;
                    } catch (Exception e) {
                        log.error("Failed to create notification for reminder {}: {}", reminder.getId(), e.getMessage());
                    }
                }
            }
        }

        log.info("Renewal check complete. Created {} notifications.", notificationsCreated);
    }
}
