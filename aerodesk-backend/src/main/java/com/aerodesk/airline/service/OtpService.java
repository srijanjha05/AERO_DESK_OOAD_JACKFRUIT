package com.aerodesk.airline.service;

import com.aerodesk.airline.entity.Otp;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;

    @Value("${otp.expiry.minutes}")
    private int otpExpiryMinutes;

    public String generateOtp(User user) {
        long recentCount = otpRepository.countByUserIdAndExpiresAtAfter(user.getId(), LocalDateTime.now());
        if (recentCount >= 3) {
            throw new RuntimeException("OTP rate limit exceeded. Please wait fully before requesting again.");
        }

        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        Otp otp = new Otp();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otp.setIsUsed(false);
        
        otpRepository.save(otp);
        
        // Simulated sending: log to console
        System.out.println("====== OTP SIMULATION ======");
        System.out.println("To: " + user.getEmail() + " | Role: " + user.getRole());
        System.out.println("OTP Code: " + otpCode);
        System.out.println("============================");

        return otpCode;
    }

    public boolean validateOtp(Long userId, String otpCode) {
        return otpRepository.findByUserIdAndOtpCodeAndIsUsedFalseAndExpiresAtAfter(userId, otpCode, LocalDateTime.now())
                .map(otp -> {
                    otp.setIsUsed(true);
                    otpRepository.save(otp);
                    return true;
                }).orElse(false);
    }
}
