package com.subtrack.repository;

import com.subtrack.entity.UserAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserActionRepository extends JpaRepository<UserAction, UUID> {
    List<UserAction> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<UserAction> findBySubscriptionIdOrderByCreatedAtDesc(UUID subscriptionId);
}
