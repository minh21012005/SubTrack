package com.subtrack.repository;

import com.subtrack.entity.ServicePreset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServicePresetRepository extends JpaRepository<ServicePreset, UUID> {
    List<ServicePreset> findByOrderByVnServiceDescNameAsc();
    List<ServicePreset> findByCategoryOrderByNameAsc(String category);
    List<ServicePreset> findByVnServiceTrueOrderByNameAsc();
}
