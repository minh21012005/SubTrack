package com.subtrack.service;

import com.subtrack.dto.response.NotificationResponse;
import com.subtrack.entity.Notification;
import com.subtrack.entity.Subscription;
import com.subtrack.entity.User;
import com.subtrack.enums.NotificationStatus;
import com.subtrack.enums.NotificationType;
import com.subtrack.exception.NotFoundException;
import com.subtrack.repository.NotificationRepository;
import com.subtrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationResponse> getUserNotifications(String email) {
        User user = getUser(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String email) {
        User user = getUser(email);
        return notificationRepository.countByUserIdAndStatus(user.getId(), NotificationStatus.UNREAD);
    }

    @Transactional
    public void markAsRead(String email, UUID notificationId) {
        User user = getUser(email);
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification không tồn tại"));
        if (!notif.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("Notification không tồn tại");
        }
        notif.setStatus(NotificationStatus.READ);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllRead(String email) {
        User user = getUser(email);
        notificationRepository.markAllReadByUserId(user.getId());
    }

    /**
     * Called by the scheduler to create a renewal reminder notification.
     */
    @Transactional
    public void createRenewalNotification(User user, Subscription subscription) {
        String message = String.format(
                "⏰ Subscription \"%s\" sẽ gia hạn vào ngày %s (%s %s)",
                subscription.getName(),
                subscription.getNextBillingDate(),
                subscription.getPrice().toPlainString(),
                subscription.getCurrency()
        );

        Notification notification = Notification.builder()
                .user(user)
                .subscription(subscription)
                .type(NotificationType.RENEWAL_REMINDER)
                .message(message)
                .status(NotificationStatus.UNREAD)
                .scheduledAt(OffsetDateTime.now())
                .sentAt(OffsetDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Created renewal notification for user {} subscription {}", user.getEmail(), subscription.getName());
    }

    /**
     * Called by PaymentService when admin approves or rejects a payment request.
     */
    @Transactional
    public void createPaymentNotification(User user, boolean approved, String billingPeriod, String notes) {
        String period = "YEARLY".equals(billingPeriod) ? "hàng năm" : "hàng tháng";
        String message;
        NotificationType type;

        if (approved) {
            message = String.format(
                "✅ Yêu cầu nâng cấp Premium (%s) của bạn đã được duyệt! Tài khoản đã được nâng cấp. Cảm ơn bạn đã tin tưởng SubTrack 🎉",
                period
            );
            type = NotificationType.PAYMENT_APPROVED;
        } else {
            String reason = (notes != null && !notes.isBlank()) ? " Lý do: " + notes : "";
            message = String.format(
                "❌ Yêu cầu nâng cấp Premium (%s) của bạn đã bị từ chối.%s Vui lòng liên hệ admin để được hỗ trợ.",
                period, reason
            );
            type = NotificationType.PAYMENT_REJECTED;
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .status(NotificationStatus.UNREAD)
                .sentAt(OffsetDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Created payment {} notification for user {}", approved ? "APPROVED" : "REJECTED", user.getEmail());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .type(n.getType())
                .status(n.getStatus())
                .subscriptionId(n.getSubscription() != null ? n.getSubscription().getId() : null)
                .subscriptionName(n.getSubscription() != null ? n.getSubscription().getName() : null)
                .createdAt(n.getCreatedAt())
                .build();
    }
}
