package com.aerodesk.airline.controller;

import com.aerodesk.airline.dto.auth.*;
import com.aerodesk.airline.security.CustomUserDetails;
import com.aerodesk.airline.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails == null ? null : userDetails.getId();
        return ResponseEntity.ok(authService.logout(userId));
    }
}
