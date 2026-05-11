package com.subtrack.repository;

import com.subtrack.dto.internal.SubscriptionDuplicateProbe;
import com.subtrack.entity.Subscription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID>, JpaSpecificationExecutor<Subscription> {

    List<Subscription> findByUserIdOrderByNextBillingDateAsc(UUID userId);

    List<Subscription> findByUserIdAndCancelledFalseOrderByNextBillingDateAsc(UUID userId);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId " +
           "AND s.cancelled = false " +
           "AND s.nextBillingDate BETWEEN :start AND :end " +
           "ORDER BY s.nextBillingDate ASC")
    List<Subscription> findUpcoming(UUID userId, LocalDate start, LocalDate end);

    long countByUserIdAndCancelledFalse(UUID userId);

    long countByCancelledFalse();

    @Query("""
            SELECT COALESCE(SUM(
                CASE s.billingCycle
                    WHEN com.subtrack.enums.BillingCycle.WEEKLY THEN s.price * 4.33
                    WHEN com.subtrack.enums.BillingCycle.MONTHLY THEN s.price
                    WHEN com.subtrack.enums.BillingCycle.QUARTERLY THEN s.price / 3
                    WHEN com.subtrack.enums.BillingCycle.YEARLY THEN s.price / 12
                    ELSE s.price
                END
            ), 0)
            FROM Subscription s WHERE s.user.id = :userId AND s.cancelled = false
            """)
    BigDecimal sumMonthlyEquivalentByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT new com.subtrack.dto.internal.SubscriptionDuplicateProbe(
                s.id,
                CASE WHEN s.preset IS NOT NULL THEN s.preset.id ELSE NULL END,
                s.name,
                s.category,
                s.cancelled
            )
            FROM Subscription s WHERE s.user.id = :userId
            """)
    List<SubscriptionDuplicateProbe> findDuplicateProbesByUserId(@Param("userId") UUID userId);

    @EntityGraph(attributePaths = "preset")
    @Query("SELECT s FROM Subscription s WHERE s.id IN :ids")
    List<Subscription> findAllWithPresetByIdIn(@Param("ids") List<UUID> ids);
}
