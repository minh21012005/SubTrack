package com.subtrack.repository;

import com.subtrack.entity.User;
import com.subtrack.enums.PlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByPlanTypeAndPlanExpiresAtBefore(PlanType planType, OffsetDateTime now);
}
