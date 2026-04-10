package com.subtrack.repository;

import com.subtrack.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findTopByEmailOrderByCreatedAtDesc(String email);
    
    int countByEmailAndCreatedAtAfter(String email, OffsetDateTime afterTime);
    
    @Modifying
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") OffsetDateTime now);
}
