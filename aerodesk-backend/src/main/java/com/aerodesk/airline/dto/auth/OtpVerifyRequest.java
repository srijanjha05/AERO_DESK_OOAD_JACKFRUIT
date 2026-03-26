package com.aerodesk.airline.dto.auth;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private Long userId;
    private String otpCode;
}
