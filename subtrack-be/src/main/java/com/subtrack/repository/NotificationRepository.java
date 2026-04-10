package com.subtrack.repository;

import com.subtrack.entity.Notification;
import com.subtrack.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, NotificationStatus status);
    long countByUserIdAndStatus(UUID userId, NotificationStatus status);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.user.id = :userId")
    void markAllReadByUserId(UUID userId);
}
