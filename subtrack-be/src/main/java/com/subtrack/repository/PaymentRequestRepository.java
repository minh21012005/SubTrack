package com.subtrack.repository;

import com.subtrack.entity.PaymentRequest;
import com.subtrack.enums.PaymentRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {
    List<PaymentRequest> findAllByOrderByCreatedAtDesc();
    List<PaymentRequest> findByStatusOrderByCreatedAtDesc(PaymentRequestStatus status);
    Page<PaymentRequest> findByStatusOrderByCreatedAtDesc(PaymentRequestStatus status, Pageable pageable);

    Optional<PaymentRequest> findTopByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, PaymentRequestStatus status);
    List<PaymentRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<PaymentRequest> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Query("SELECT p FROM PaymentRequest p WHERE p.user.id = :userId AND p.createdAt >= :since")
    Page<PaymentRequest> findByUserIdSince(
            @Param("userId") UUID userId,
            @Param("since") OffsetDateTime since,
            Pageable pageable);

    @Query("SELECT p FROM PaymentRequest p WHERE p.status IN :statuses AND p.createdAt >= :since")
    Page<PaymentRequest> findProcessedSince(
            @Param("statuses") List<PaymentRequestStatus> statuses,
            @Param("since") OffsetDateTime since,
            Pageable pageable);

    long countByStatus(PaymentRequestStatus status);
}
