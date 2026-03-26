package com.aerodesk.airline.dto.auth;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String passportNumber;
    private String nationality;
    private LocalDate dateOfBirth;
    private String gender;
    private String addressLine;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
