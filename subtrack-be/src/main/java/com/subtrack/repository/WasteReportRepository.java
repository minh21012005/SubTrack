package com.subtrack.repository;

import com.subtrack.entity.WasteReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WasteReportRepository extends JpaRepository<WasteReport, UUID> {
    List<WasteReport> findByUserIdOrderByCalculationDateDesc(UUID userId);
    Optional<WasteReport> findByUserIdAndCalculationDate(UUID userId, LocalDate date);
}
