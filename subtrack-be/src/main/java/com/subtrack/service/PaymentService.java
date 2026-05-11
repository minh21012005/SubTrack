package com.subtrack.service;

import com.subtrack.dto.response.PageResponse;
import com.subtrack.dto.response.PaymentRequestDTO;
import com.subtrack.entity.PaymentRequest;
import com.subtrack.entity.User;
import com.subtrack.enums.BillingPeriod;
import com.subtrack.enums.PaymentRequestStatus;
import com.subtrack.enums.PlanType;
import com.subtrack.exception.BadRequestException;
import com.subtrack.repository.PaymentRequestRepository;
import com.subtrack.repository.RenewalReminderRepository;
import com.subtrack.repository.UserRepository;
import com.subtrack.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRequestRepository paymentRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RenewalReminderRepository renewalReminderRepository;
    private final PlanService planService;


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

        // Generate unique transfer content at creation time
        String emailPrefix = user.getEmail().split("@")[0].toUpperCase();
        String transferContent = "SUBTRACK " + emailPrefix + " " + billingPeriod.name();

        PaymentRequest request = PaymentRequest.builder()
                .user(user)
                .planType(PlanType.PREMIUM)
                .billingPeriod(billingPeriod)
                .amount(amount)
                .status(PaymentRequestStatus.PENDING)
                .transferContent(transferContent)
                .build();

        paymentRequestRepository.save(request);
        return toDTO(request);
    }

    /**
     * Billing history for the current user: only recent rows to avoid huge payloads (see {@code months}).
     */
    @Transactional(readOnly = true)
    public PageResponse<PaymentRequestDTO> getMyRequestsPage(String email, int page, int size, int months) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Tài khoản không tồn tại"));
        OffsetDateTime since = OffsetDateTime.now().minus(months, ChronoUnit.MONTHS);
        Page<PaymentRequest> p = paymentRequestRepository.findByUserIdSince(
                user.getId(),
                since,
                PaginationUtil.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.from(p, this::toDTO);
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentRequestDTO> getPendingRequestsPage(int page, int size) {
        Page<PaymentRequest> p = paymentRequestRepository.findByStatusOrderByCreatedAtDesc(
                PaymentRequestStatus.PENDING,
                PaginationUtil.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.from(p, this::toDTO);
    }

    /**
     * Admin: processed payment records (approved/rejected), limited to {@code months} back.
     */
    @Transactional(readOnly = true)
    public PageResponse<PaymentRequestDTO> getProcessedHistoryPage(int page, int size, int months) {
        OffsetDateTime since = OffsetDateTime.now().minus(months, ChronoUnit.MONTHS);
        List<PaymentRequestStatus> statuses = List.of(PaymentRequestStatus.APPROVED, PaymentRequestStatus.REJECTED);
        Page<PaymentRequest> p = paymentRequestRepository.findProcessedSince(
                statuses,
                since,
                PaginationUtil.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.from(p, this::toDTO);
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

        // Upgrade user plan using PlanService
        User user = req.getUser();
        user.setBillingPeriod(req.getBillingPeriod());
        
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiresAt = (req.getBillingPeriod() == BillingPeriod.YEARLY) 
                ? now.plusDays(365) : now.plusDays(31);

        planService.upgradeToPremium(user, expiresAt);


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
                .transferContent(req.getTransferContent())
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
