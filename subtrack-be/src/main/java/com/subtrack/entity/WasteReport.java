package com.subtrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "waste_reports")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_monthly_cost", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalMonthlyCost = BigDecimal.ZERO;

    @Column(name = "total_waste_cost", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalWasteCost = BigDecimal.ZERO;

    @Column(name = "calculation_date", nullable = false)
    private LocalDate calculationDate;

    @Column(columnDefinition = "TEXT")
    private String breakdown;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
