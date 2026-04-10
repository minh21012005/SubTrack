package com.subtrack.repository;

import com.subtrack.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    List<Subscription> findByUserIdOrderByNextBillingDateAsc(UUID userId);

    List<Subscription> findByUserIdAndCancelledFalseOrderByNextBillingDateAsc(UUID userId);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId " +
           "AND s.cancelled = false " +
           "AND s.nextBillingDate BETWEEN :start AND :end " +
           "ORDER BY s.nextBillingDate ASC")
    List<Subscription> findUpcoming(UUID userId, LocalDate start, LocalDate end);

    long countByUserIdAndCancelledFalse(UUID userId);
}
