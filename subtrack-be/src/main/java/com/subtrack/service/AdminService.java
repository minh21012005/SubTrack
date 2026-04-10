package com.subtrack.service;

import com.subtrack.dto.response.AdminUserDTO;
import com.subtrack.entity.Subscription;
import com.subtrack.entity.User;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        return users.stream().map(user -> {
            long activeCount = user.getSubscriptions().stream()
                    .filter(s -> !s.isCancelled())
                    .count();
            
            BigDecimal monthlySpend = user.getSubscriptions().stream()
                    .filter(s -> !s.isCancelled())
                    .map(this::calculateMonthlyCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
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
        }).collect(Collectors.toList());
    }

    private BigDecimal calculateMonthlyCost(Subscription sub) {
        if (sub.getPrice() == null) return BigDecimal.ZERO;
        return switch (sub.getBillingCycle()) {
            case WEEKLY -> sub.getPrice().multiply(BigDecimal.valueOf(4.33)).setScale(0, RoundingMode.HALF_UP);
            case MONTHLY -> sub.getPrice();
            case QUARTERLY -> sub.getPrice().divide(BigDecimal.valueOf(3), 0, RoundingMode.HALF_UP);
            case YEARLY -> sub.getPrice().divide(BigDecimal.valueOf(12), 0, RoundingMode.HALF_UP);
        };
    }
}
