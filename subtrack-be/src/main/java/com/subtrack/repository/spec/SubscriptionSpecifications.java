package com.subtrack.repository.spec;

import com.subtrack.entity.Subscription;
import com.subtrack.enums.UsageStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.UUID;

public final class SubscriptionSpecifications {

    private SubscriptionSpecifications() {}

    /**
     * @param filter all | active | waste | cancelled
     */
    public static Specification<Subscription> forUserSubscriptions(
            UUID userId,
            String search,
            String filter) {
        return (root, query, cb) -> {
            var parts = new ArrayList<jakarta.persistence.criteria.Predicate>();
            parts.add(cb.equal(root.get("user").get("id"), userId));

            if (search != null && !search.isBlank()) {
                String p = "%" + search.trim().toLowerCase() + "%";
                parts.add(cb.or(
                        cb.like(cb.lower(root.get("name")), p),
                        cb.like(cb.lower(root.get("category")), p)
                ));
            }

            String f = filter == null ? "all" : filter.trim().toLowerCase();
            switch (f) {
                case "active" -> parts.add(cb.and(
                        cb.isFalse(root.get("cancelled")),
                        cb.equal(root.get("usageStatus"), UsageStatus.ACTIVE)
                ));
                case "waste" -> parts.add(cb.and(
                        cb.isFalse(root.get("cancelled")),
                        root.get("usageStatus").in(UsageStatus.UNUSED, UsageStatus.RARELY)
                ));
                case "cancelled" -> parts.add(cb.isTrue(root.get("cancelled")));
                default -> { /* all */ }
            }

            return cb.and(parts.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }
}
