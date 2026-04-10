package com.subtrack.service;

import com.subtrack.dto.response.PresetResponse;
import com.subtrack.repository.ServicePresetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresetService {

    private final ServicePresetRepository presetRepository;

    public List<PresetResponse> getAllPresets() {
        return presetRepository.findByOrderByVnServiceDescNameAsc().stream()
                .map(p -> PresetResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .category(p.getCategory())
                        .defaultPrice(p.getDefaultPrice())
                        .currency(p.getCurrency())
                        .billingCycle(p.getBillingCycle())
                        .iconUrl(p.getIconUrl())
                        .color(p.getColor())
                        .websiteUrl(p.getWebsiteUrl())
                        .description(p.getDescription())
                        .vnService(p.isVnService())
                        .build())
                .collect(Collectors.toList());
    }

    public List<PresetResponse> getByCategory(String category) {
        return presetRepository.findByCategoryOrderByNameAsc(category).stream()
                .map(p -> PresetResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .category(p.getCategory())
                        .defaultPrice(p.getDefaultPrice())
                        .currency(p.getCurrency())
                        .billingCycle(p.getBillingCycle())
                        .iconUrl(p.getIconUrl())
                        .color(p.getColor())
                        .websiteUrl(p.getWebsiteUrl())
                        .description(p.getDescription())
                        .vnService(p.isVnService())
                        .build())
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return presetRepository.findByOrderByVnServiceDescNameAsc().stream()
                .map(p -> p.getCategory())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
