package com.aerodesk.airline.repository;

import com.aerodesk.airline.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByUserIdAndOtpCodeAndIsUsedFalseAndExpiresAtAfter(Long userId, String otpCode, LocalDateTime now);
}
