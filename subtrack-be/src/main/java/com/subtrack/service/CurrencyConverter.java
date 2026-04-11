package com.subtrack.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Converts prices between currencies.
 * All aggregated totals (Dashboard, WasteAnalysis) are normalized to VND.
 * Each individual Subscription still stores and displays its original currency.
 */
@Component
public class CurrencyConverter {

    @Value("${app.exchange-rate.usd-to-vnd:26335.96}")
    private double usdToVnd;

    /**
     * Convert any supported amount to VND.
     * @param amount original price
     * @param currency "VND" or "USD"
     * @return equivalent amount in VND
     */
    public BigDecimal toVnd(BigDecimal amount, String currency) {
        if (amount == null) return BigDecimal.ZERO;
        return switch (currency.toUpperCase()) {
            case "USD" -> amount.multiply(BigDecimal.valueOf(usdToVnd)).setScale(0, RoundingMode.HALF_UP);
            case "VND" -> amount.setScale(0, RoundingMode.HALF_UP);
            default -> amount;
        };
    }
}
