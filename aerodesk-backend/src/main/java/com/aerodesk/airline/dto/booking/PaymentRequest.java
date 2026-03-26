package com.aerodesk.airline.dto.booking;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String paymentMethod;
    private BigDecimal amount;
}
