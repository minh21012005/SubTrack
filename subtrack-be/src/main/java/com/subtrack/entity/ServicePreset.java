package com.subtrack.entity;

import com.subtrack.enums.BillingCycle;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_presets")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePreset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(name = "default_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal defaultPrice;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    @Builder.Default
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @Column(name = "icon_url")
    private String iconUrl;

    private String color;

    @Column(name = "website_url")
    private String websiteUrl;

    private String description;

    @Column(name = "is_vn_service", nullable = false)
    @Builder.Default
    private boolean vnService = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
