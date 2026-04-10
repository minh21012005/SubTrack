package com.subtrack.repository;

import com.subtrack.entity.PaymentRequest;
import com.subtrack.enums.PaymentRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {
    List<PaymentRequest> findAllByOrderByCreatedAtDesc();
    List<PaymentRequest> findByStatusOrderByCreatedAtDesc(PaymentRequestStatus status);
    Optional<PaymentRequest> findTopByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, PaymentRequestStatus status);
    List<PaymentRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
