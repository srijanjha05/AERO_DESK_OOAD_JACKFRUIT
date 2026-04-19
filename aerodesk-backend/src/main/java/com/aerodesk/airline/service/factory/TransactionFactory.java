package com.aerodesk.airline.service.factory;

import com.aerodesk.airline.dto.booking.PaymentRequest;
import com.aerodesk.airline.entity.Booking;
import com.aerodesk.airline.entity.Invoice;
import com.aerodesk.airline.entity.Payment;
import com.aerodesk.airline.entity.Refund;
import com.aerodesk.airline.entity.enums.PaymentMethod;
import com.aerodesk.airline.entity.enums.PaymentStatus;
import com.aerodesk.airline.entity.enums.RefundStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class TransactionFactory {

    public Payment createSuccessfulPayment(Booking booking, PaymentRequest request) {
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaidAt(LocalDateTime.now());
        return payment;
    }

    public Invoice createInvoiceForBooking(Booking booking) {
        Invoice invoice = new Invoice();
        invoice.setBooking(booking);
        invoice.setInvoiceNumber("INV-" + booking.getPnrCode() + "-" + LocalDate.now().toString().replace("-", ""));
        invoice.setTotalAmount(booking.getTotalAmount());
        BigDecimal tax = booking.getTotalAmount().multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        invoice.setTaxAmount(tax);
        invoice.setBaseFare(booking.getTotalAmount().subtract(tax));
        invoice.setIssuedAt(LocalDateTime.now());
        return invoice;
    }

    public Refund createRequestedRefund(Payment payment, BigDecimal refundAmount, String reason) {
        Refund refund = new Refund();
        refund.setPayment(payment);
        refund.setRefundAmount(refundAmount);
        refund.setStatus(RefundStatus.REQUESTED);
        refund.setRequestDate(LocalDate.now());
        refund.setReason(reason);
        return refund;
    }
}
