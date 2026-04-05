package com.aerodesk.airline.controller;

import com.aerodesk.airline.dto.admin.RoleAssignmentRequest;
import com.aerodesk.airline.dto.booking.BookingRequest;
import com.aerodesk.airline.entity.*;
import com.aerodesk.airline.security.CustomUserDetails;
import com.aerodesk.airline.service.AdminService;
import com.aerodesk.airline.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final BookingService bookingService;

    // --- EMPLOYEE ENDPOINTS ---

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping("/passengers/search")
    public ResponseEntity<List<Passenger>> searchPassengers(@RequestParam String q) {
        return ResponseEntity.ok(adminService.searchPassengers(q));
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping("/passengers/{id}")
    public ResponseEntity<Passenger> getPassenger(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getPassenger(id));
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @PostMapping("/bookings")
    public ResponseEntity<Booking> assistBooking(@RequestBody BookingRequest request,
                                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.createBooking(request, userDetails.getId()));
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping("/bookings/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getBooking(id, userDetails.getId()));
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping("/bookings/pnr/{pnrCode}")
    public ResponseEntity<Booking> getBookingByPnr(@PathVariable String pnrCode) {
        return ResponseEntity.ok(adminService.getBookingByPnr(pnrCode));
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping("/passengers/{passengerId}/bookings")
    public ResponseEntity<List<Booking>> getPassengerBookings(@PathVariable Long passengerId) {
        return ResponseEntity.ok(adminService.getPassengerBookings(passengerId));
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @PostMapping("/checkin/{bookingId}")
    public ResponseEntity<CheckIn> counterCheckIn(@PathVariable Long bookingId,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(adminService.counterCheckIn(bookingId, userDetails.getId()));
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @PostMapping("/refunds")
    public ResponseEntity<Refund> createRefundRequest(@RequestBody Map<String, Object> payload,
                                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long bookingId = Long.valueOf(payload.get("bookingId").toString());
        String reason = (String) payload.get("reason");
        return ResponseEntity.ok(adminService.createRefundRequest(bookingId, reason, userDetails.getId()));
    }

    // --- ADMIN (CEO) ENDPOINTS ---

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reports/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueReport() {
        return ResponseEntity.ok(adminService.getRevenueReport());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reports/occupancy")
    public ResponseEntity<List<Map<String, Object>>> getOccupancyReport() {
        return ResponseEntity.ok(adminService.getOccupancyReport());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reports/punctuality")
    public ResponseEntity<List<Map<String, Object>>> getPunctualityReport() {
        return ResponseEntity.ok(adminService.getPunctualityReport());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(adminService.getAllUsers(q));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/roles")
    public ResponseEntity<User> assignRole(@RequestBody RoleAssignmentRequest request,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(adminService.assignRole(request, userDetails.getId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/roles/{id}")
    public ResponseEntity<User> updateRole(@PathVariable Long id,
                                           @RequestBody RoleAssignmentRequest request,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(adminService.updateRole(id, request, userDetails.getId()));
    }
}
