package com.aerodesk.airline.service;

import com.aerodesk.airline.dto.admin.RoleAssignmentRequest;
import com.aerodesk.airline.entity.AuditLog;
import com.aerodesk.airline.entity.Booking;
import com.aerodesk.airline.entity.CheckIn;
import com.aerodesk.airline.entity.Passenger;
import com.aerodesk.airline.entity.Refund;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.entity.enums.BookingStatus;
import com.aerodesk.airline.entity.enums.FlightStatus;
import com.aerodesk.airline.entity.enums.PaymentStatus;
import com.aerodesk.airline.entity.enums.RefundStatus;
import com.aerodesk.airline.repository.AuditLogRepository;
import com.aerodesk.airline.repository.BookingRepository;
import com.aerodesk.airline.repository.FlightRepository;
import com.aerodesk.airline.repository.PassengerRepository;
import com.aerodesk.airline.repository.PaymentRepository;
import com.aerodesk.airline.repository.RefundRepository;
import com.aerodesk.airline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PassengerRepository passengerRepository;
    private final BookingRepository bookingRepository;
    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final BookingService bookingService;
    private final AuditService auditService;

    public List<Passenger> searchPassengers(String query) {
        String normalized = query.toLowerCase();
        return passengerRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(normalized)
                        || p.getEmail().toLowerCase().contains(normalized)
                        || (p.getPassportNumber() != null && p.getPassportNumber().toLowerCase().contains(normalized)))
                .toList();
    }

    public Passenger getPassenger(Long id) {
        return passengerRepository.findById(id).orElseThrow();
    }

    @Transactional
    public CheckIn counterCheckIn(Long bookingId, Long actingUserId) {
        return bookingService.counterCheckIn(bookingId, actingUserId);
    }

    @Transactional
    public Refund createRefundRequest(Long bookingId, String reason, Long actingUserId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        if (booking.getStatus() != BookingStatus.CANCELLED) {
            throw new RuntimeException("Only cancelled bookings can have a manual refund request");
        }

        Refund refund = paymentRepository.findByBookingId(bookingId)
                .map(payment -> {
                    Refund item = new Refund();
                    item.setPayment(payment);
                    item.setRefundAmount(payment.getAmount().setScale(2, RoundingMode.HALF_UP));
                    item.setStatus(RefundStatus.REQUESTED);
                    item.setRequestDate(LocalDate.now());
                    item.setReason(reason);
                    return refundRepository.save(item);
                })
                .orElseThrow(() -> new RuntimeException("Payment not found for booking"));

        auditService.log(actingUserId, "REFUND_REQUEST_CREATED", "REFUND", refund.getId().toString(), "SYSTEM");
        return refund;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll();
    }

    public List<Map<String, Object>> getRevenueReport() {
        BigDecimal todayRevenue = paymentRepository.findAll().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS && payment.getPaidAt() != null)
                .filter(payment -> payment.getPaidAt().toLocalDate().equals(LocalDate.now()))
                .map(payment -> payment.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.SUCCESS)
                .map(payment -> payment.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return List.of(
                reportRow("metric", "today", "amount", todayRevenue),
                reportRow("metric", "total", "amount", totalRevenue)
        );
    }

    public List<Map<String, Object>> getOccupancyReport() {
        return flightRepository.findAll().stream()
                .map(flight -> {
                    long bookedSeats = bookingRepository.findByFlightId(flight.getId()).stream()
                            .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                            .mapToLong(booking -> booking.getSeats().size())
                            .sum();
                    int capacity = flight.getAircraft().getTotalSeats();
                    double occupancy = capacity == 0 ? 0 : (bookedSeats * 100.0) / capacity;
                    return reportRow("route",
                            flight.getOriginAirport().getCode() + "-" + flight.getDestinationAirport().getCode(),
                            "occupancy",
                            BigDecimal.valueOf(occupancy).setScale(2, RoundingMode.HALF_UP));
                })
                .toList();
    }

    public List<Map<String, Object>> getPunctualityReport() {
        return List.of(
                reportRow("status", "ARRIVED", "count", flightRepository.countByStatus(FlightStatus.ARRIVED)),
                reportRow("status", "DELAYED", "count", flightRepository.countByStatus(FlightStatus.DELAYED)),
                reportRow("status", "CANCELLED", "count", flightRepository.countByStatus(FlightStatus.CANCELLED))
        );
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User assignRole(RoleAssignmentRequest request, Long actingUserId) {
        User user = userRepository.findById(request.getUserId()).orElseThrow();
        user.setRole(request.getRole());
        User saved = userRepository.save(user);
        auditService.log(actingUserId, "ROLE_ASSIGNED", "USER", saved.getId().toString(), "SYSTEM");
        return saved;
    }

    @Transactional
    public User updateRole(Long userId, RoleAssignmentRequest request, Long actingUserId) {
        request.setUserId(userId);
        return assignRole(request, actingUserId);
    }

    private Map<String, Object> reportRow(String key1, Object value1, String key2, Object value2) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put(key1, value1);
        row.put(key2, value2);
        return row;
    }
}
