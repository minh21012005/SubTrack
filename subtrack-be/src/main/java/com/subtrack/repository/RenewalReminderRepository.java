package com.subtrack.repository;

import com.subtrack.entity.RenewalReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RenewalReminderRepository extends JpaRepository<RenewalReminder, UUID> {
    Optional<RenewalReminder> findBySubscriptionId(UUID subscriptionId);

    @Query("SELECT r FROM RenewalReminder r " +
           "JOIN r.subscription s " +
           "WHERE r.active = true " +
           "AND s.cancelled = false " +
           "AND s.nextBillingDate = :targetDate")
    List<RenewalReminder> findDueReminders(LocalDate targetDate);

    @Query("SELECT r FROM RenewalReminder r WHERE r.subscription.user.id = :userId")
    List<RenewalReminder> findByUserId(UUID userId);

    @Modifying
    @Query("UPDATE RenewalReminder r SET r.daysBefore = :days WHERE r.subscription.user.id = :userId")
    void updateDaysBeforeByUserId(UUID userId, int days);
}
