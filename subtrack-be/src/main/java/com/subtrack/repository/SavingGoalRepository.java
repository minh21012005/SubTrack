package com.subtrack.repository;

import com.subtrack.entity.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavingGoalRepository extends JpaRepository<SavingGoal, UUID> {
    List<SavingGoal> findByUserIdOrderByAchievedAscNameAsc(UUID userId);
    List<SavingGoal> findByUserIdAndAchievedFalse(UUID userId);
}
