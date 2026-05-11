package com.subtrack.service;

import com.subtrack.dto.response.AdminSummaryDTO;
import com.subtrack.dto.response.AdminUserDTO;
import com.subtrack.dto.response.PageResponse;
import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import com.subtrack.enums.PaymentRequestStatus;
import com.subtrack.repository.PaymentRequestRepository;
import com.subtrack.repository.SubscriptionRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.subtrack.util.PaginationUtil;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRequestRepository paymentRequestRepository;

    @Transactional(readOnly = true)
    public AdminSummaryDTO getSummary() {
        return AdminSummaryDTO.builder()
                .totalUsers(userRepository.count())
                .premiumUsers(userRepository.countByPlanType(PlanType.PREMIUM))
                .totalActiveSubscriptions(subscriptionRepository.countByCancelledFalse())
                .pendingPaymentRequests(paymentRequestRepository.countByStatus(PaymentRequestStatus.PENDING))
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserDTO> getUsersPage(String search, int page, int size) {
        Specification<User> spec = userSearchSpec(search);
        Page<User> userPage = userRepository.findAll(spec,
                PaginationUtil.page(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        Page<AdminUserDTO> mapped = userPage.map(user -> {
            long activeCount = subscriptionRepository.countByUserIdAndCancelledFalse(user.getId());
            BigDecimal monthlySpend = subscriptionRepository.sumMonthlyEquivalentByUserId(user.getId());
            if (monthlySpend == null) {
                monthlySpend = BigDecimal.ZERO;
            }
            return AdminUserDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .planType(user.getPlanType())
                    .role(user.getRole())
                    .activeSubscriptions(activeCount)
                    .totalMonthlySpend(monthlySpend)
                    .createdAt(user.getCreatedAt())
                    .build();
        });

        return PageResponse.from(mapped);
    }

    private static Specification<User> userSearchSpec(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String p = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("email")), p),
                    cb.like(cb.lower(root.get("name")), p)
            );
        };
    }
}
