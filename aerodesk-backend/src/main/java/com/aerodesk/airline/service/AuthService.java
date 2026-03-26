package com.aerodesk.airline.service;

import com.aerodesk.airline.dto.auth.*;
import com.aerodesk.airline.entity.Admin;
import com.aerodesk.airline.entity.AirportManager;
import com.aerodesk.airline.entity.Employee;
import com.aerodesk.airline.entity.Passenger;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.entity.enums.Role;
import com.aerodesk.airline.repository.AdminRepository;
import com.aerodesk.airline.repository.AirportManagerRepository;
import com.aerodesk.airline.repository.EmployeeRepository;
import com.aerodesk.airline.repository.PassengerRepository;
import com.aerodesk.airline.repository.UserRepository;
import com.aerodesk.airline.security.CustomUserDetails;
import com.aerodesk.airline.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PassengerRepository passengerRepository;
    private final EmployeeRepository employeeRepository;
    private final AirportManagerRepository airportManagerRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final AuditService auditService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already taken");
        }

        Passenger passenger = new Passenger();
        passenger.setName(request.getName());
        passenger.setEmail(request.getEmail());
        passenger.setPassword(passwordEncoder.encode(request.getPassword()));
        passenger.setPhone(request.getPhone());
        passenger.setRole(Role.PASSENGER);
        passenger.setPassportNumber(request.getPassportNumber());
        passenger.setNationality(request.getNationality());
        passenger.setDateOfBirth(request.getDateOfBirth());
        passenger.setGender(request.getGender());
        passenger.setAddressLine(request.getAddressLine());
        passenger.setEmergencyContactName(request.getEmergencyContactName());
        passenger.setEmergencyContactPhone(request.getEmergencyContactPhone());

        passengerRepository.save(passenger);

        CustomUserDetails userDetails = new CustomUserDetails(passenger);
        String token = jwtUtil.generateToken(userDetails);
        auditService.log(passenger.getId(), "REGISTER", "USER", passenger.getId().toString(), "SELF");

        return new AuthResponse(token, "Registered successfully", passenger.getId(), passenger.getRole().name(), false);
    }

    public AuthResponse login(LoginRequest request) {
        User user = resolveUser(request.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (user.getRole() == Role.PASSENGER) {
            String token = jwtUtil.generateToken(userDetails);
            auditService.log(user.getId(), "LOGIN", "USER", user.getId().toString(), "SELF");
            return new AuthResponse(token, "Login successful", user.getId(), user.getRole().name(), false);
        } else {
            String otpCode = otpService.generateOtp(user);
            auditService.log(user.getId(), "LOGIN_OTP_REQUESTED", "USER", user.getId().toString(), "SELF");
            return new AuthResponse(null, "OTP sent to console for dev. OTP is " + otpCode, user.getId(), user.getRole().name(), true);
        }
    }

    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!otpService.validateOtp(user.getId(), request.getOtpCode())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);
        auditService.log(user.getId(), "OTP_VERIFIED", "USER", user.getId().toString(), "SELF");

        return new AuthResponse(token, "OTP verified successfully", user.getId(), user.getRole().name(), false);
    }

    public AuthResponse logout(Long userId) {
        auditService.log(userId, "LOGOUT", "USER", userId.toString(), "SELF");
        return new AuthResponse(null, "Logged out successfully", userId, null, false);
    }

    private User resolveUser(String identifier) {
        Passenger passenger = passengerRepository.findByEmail(identifier).orElse(null);
        if (passenger != null) {
            return passenger;
        }

        User user = userRepository.findByEmail(identifier).orElse(null);
        if (user != null) {
            return user;
        }

        Employee employee = employeeRepository.findByEmployeeId(identifier).orElse(null);
        if (employee != null) {
            return employee;
        }

        Admin admin = adminRepository.findByAdminId(identifier).orElse(null);
        if (admin != null) {
            return admin;
        }

        AirportManager manager = airportManagerRepository.findAll().stream()
                .filter(candidate -> identifier.equalsIgnoreCase(candidate.getEmail()))
                .findFirst()
                .orElse(null);
        if (manager != null) {
            return manager;
        }

        throw new RuntimeException("User not found");
    }
}
