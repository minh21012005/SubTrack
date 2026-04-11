package com.subtrack.repository;

import com.subtrack.entity.SpendingSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpendingSnapshotRepository extends JpaRepository<SpendingSnapshot, UUID> {
    List<SpendingSnapshot> findByUserIdOrderByMonthYearAsc(UUID userId);
}
