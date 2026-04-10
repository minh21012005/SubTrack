package com.subtrack.service;

import com.subtrack.dto.response.PaymentRequestDTO;
import com.subtrack.entity.PaymentRequest;
import com.subtrack.entity.User;
import com.subtrack.enums.BillingPeriod;
import com.subtrack.enums.PaymentRequestStatus;
import com.subtrack.enums.PlanType;
import com.subtrack.exception.BadRequestException;
import com.subtrack.repository.PaymentRequestRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRequestRepository paymentRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final BigDecimal PRICE_MONTHLY = new BigDecimal("29000");
    private static final BigDecimal PRICE_YEARLY  = new BigDecimal("199000");

    @Transactional
    public PaymentRequestDTO createRequest(String email, BillingPeriod billingPeriod) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));

        if (user.getPlanType() == PlanType.PREMIUM) {
            throw new BadRequestException("Tài khoản của bạn đã là Premium");
        }

        // Check if there's already a pending request
        boolean hasPending = paymentRequestRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), PaymentRequestStatus.PENDING)
                .isPresent();
        if (hasPending) {
            throw new BadRequestException("Bạn đã có yêu cầu nâng cấp đang chờ xử lý");
        }

        BigDecimal amount = billingPeriod == BillingPeriod.YEARLY ? PRICE_YEARLY : PRICE_MONTHLY;

        PaymentRequest request = PaymentRequest.builder()
                .user(user)
                .planType(PlanType.PREMIUM)
                .billingPeriod(billingPeriod)
                .amount(amount)
                .status(PaymentRequestStatus.PENDING)
                .build();

        paymentRequestRepository.save(request);
        return toDTO(request);
    }

    @Transactional(readOnly = true)
    public List<PaymentRequestDTO> getMyRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
        return paymentRequestRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentRequestDTO> getAllRequests() {
        return paymentRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public PaymentRequestDTO approve(UUID requestId, String adminEmail) {
        PaymentRequest req = paymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy yêu cầu"));

        if (req.getStatus() != PaymentRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý");
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new BadRequestException("Admin không tồn tại"));

        // Upgrade user plan
        User user = req.getUser();
        user.setPlanType(PlanType.PREMIUM);
        userRepository.save(user);

        req.setStatus(PaymentRequestStatus.APPROVED);
        req.setVerifiedAt(OffsetDateTime.now());
        req.setVerifiedBy(admin);
        paymentRequestRepository.save(req);

        // Notify user
        notificationService.createPaymentNotification(user, true, req.getBillingPeriod().name(), null);

        return toDTO(req);
    }

    @Transactional
    public PaymentRequestDTO reject(UUID requestId, String adminEmail, String notes) {
        PaymentRequest req = paymentRequestRepository.findById(requestId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy yêu cầu"));

        if (req.getStatus() != PaymentRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý");
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new BadRequestException("Admin không tồn tại"));

        req.setStatus(PaymentRequestStatus.REJECTED);
        req.setNotes(notes);
        req.setVerifiedAt(OffsetDateTime.now());
        req.setVerifiedBy(admin);
        paymentRequestRepository.save(req);

        // Notify user
        notificationService.createPaymentNotification(req.getUser(), false, req.getBillingPeriod().name(), notes);

        return toDTO(req);
    }

    private PaymentRequestDTO toDTO(PaymentRequest req) {
        // Build the expected transfer content so admin can verify against bank statement
        String emailPrefix = req.getUser().getEmail().split("@")[0].toUpperCase();
        String transferContent = "SUBTRACK " + emailPrefix + " " + req.getBillingPeriod().name();

        return PaymentRequestDTO.builder()
                .id(req.getId())
                .userId(req.getUser().getId())
                .userName(req.getUser().getName())
                .userEmail(req.getUser().getEmail())
                .transferContent(transferContent)
                .planType(req.getPlanType())
                .billingPeriod(req.getBillingPeriod())
                .amount(req.getAmount())
                .status(req.getStatus())
                .notes(req.getNotes())
                .createdAt(req.getCreatedAt())
                .verifiedAt(req.getVerifiedAt())
                .verifiedByName(req.getVerifiedBy() != null ? req.getVerifiedBy().getName() : null)
                .build();
    }
}
