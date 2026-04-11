package com.subtrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "spending_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpendingSnapshot {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 7)
    private String monthYear; // Format: YYYY-MM

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalCost;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal wasteCost;

    @Column(nullable = false)
    private int subscriptionCount;
}
