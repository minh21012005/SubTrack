package com.subtrack.repository;

import com.subtrack.entity.RenewalReminder;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
