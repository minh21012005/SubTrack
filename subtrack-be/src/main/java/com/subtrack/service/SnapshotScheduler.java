package com.subtrack.service;

import com.subtrack.entity.SpendingSnapshot;
import com.subtrack.entity.Subscription;
import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.enums.UsageStatus;
import com.subtrack.repository.SpendingSnapshotRepository;
import com.subtrack.repository.SubscriptionRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SnapshotScheduler {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SpendingSnapshotRepository snapshotRepository;
    private final WasteEngine wasteEngine;

    // Run at 23:55 on the last day of every month
    @Scheduled(cron = "0 55 23 L * ?")
    public void captureMonthlySnapshots() {
        log.info("Starting monthly spending snapshots...");
        List<User> users = userRepository.findAll();
        String currentMonthYear = LocalDate.now().toString().substring(0, 7); // e.g., "2026-04"

        for (User user : users) {
            // Only Premium users really need snapshots historically, but we can capture for everyone
            List<Subscription> subs = subscriptionRepository.findByUserIdOrderByNextBillingDateAsc(user.getId());
            
            java.math.BigDecimal totalCost = java.math.BigDecimal.ZERO;
            java.math.BigDecimal wasteCost = java.math.BigDecimal.ZERO;
            int count = 0;

            for (Subscription sub : subs) {
                if (!sub.isCancelled()) {
                    count++;
                    java.math.BigDecimal monthly = wasteEngine.toMonthly(sub.getPrice(), sub.getBillingCycle());
                    totalCost = totalCost.add(monthly);
                    if (sub.getUsageStatus() == UsageStatus.RARELY || sub.getUsageStatus() == UsageStatus.UNUSED) {
                        wasteCost = wasteCost.add(monthly);
                    }
                }
            }

            SpendingSnapshot snapshot = SpendingSnapshot.builder()
                    .userId(user.getId())
                    .monthYear(currentMonthYear)
                    .totalCost(totalCost)
                    .wasteCost(wasteCost)
                    .subscriptionCount(count)
                    .build();

            snapshotRepository.save(snapshot);
        }
        log.info("Finished monthly snapshots for {} users.", users.size());
    }
}
