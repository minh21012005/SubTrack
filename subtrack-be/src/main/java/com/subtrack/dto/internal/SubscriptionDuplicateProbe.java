package com.subtrack.dto.internal;

import java.util.UUID;

/**
 * Lightweight row for duplicate detection without loading full subscription entities.
 */
public record SubscriptionDuplicateProbe(
        UUID id,
        UUID presetId,
        String name,
        String category,
        boolean cancelled
) {}
