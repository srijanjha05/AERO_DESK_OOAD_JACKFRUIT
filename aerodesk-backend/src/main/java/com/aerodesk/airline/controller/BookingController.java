package com.aerodesk.airline.controller;

import com.aerodesk.airline.dto.booking.BookingRequest;
import com.aerodesk.airline.dto.booking.PaymentRequest;
import com.aerodesk.airline.entity.BoardingPass;
import com.aerodesk.airline.entity.Booking;
import com.aerodesk.airline.entity.CheckIn;
import com.aerodesk.airline.entity.Payment;
import com.aerodesk.airline.security.CustomUserDetails;
import com.aerodesk.airline.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PreAuthorize("hasRole('PASSENGER') or hasRole('EMPLOYEE')")
    @PostMapping("/bookings")
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.createBooking(request, userDetails.getId()));
    }

    @PreAuthorize("hasRole('PASSENGER')")
    @PostMapping("/bookings/{id}/pay")
    public ResponseEntity<Payment> payBooking(@PathVariable Long id,
                                              @RequestBody PaymentRequest request,
                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.processPayment(id, request, userDetails.getId()));
    }

    @PreAuthorize("hasRole('PASSENGER')")
    @GetMapping("/bookings/my")
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getMyBookings(userDetails.getId()));
    }

    @PreAuthorize("hasRole('PASSENGER') or hasRole('EMPLOYEE')")
    @GetMapping("/bookings/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id,
                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getBooking(id, userDetails.getId()));
    }

    @PreAuthorize("hasRole('PASSENGER')")
    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, userDetails.getId()));
    }

    @PreAuthorize("hasRole('PASSENGER')")
    @PostMapping("/checkin/{id}")
    public ResponseEntity<CheckIn> webCheckIn(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.webCheckIn(id, userDetails.getId()));
    }

    @PreAuthorize("hasRole('PASSENGER') or hasRole('EMPLOYEE') or hasRole('AIRPORT_MANAGER') or hasRole('ADMIN')")
    @GetMapping("/boarding-pass/{checkInId}")
    public ResponseEntity<BoardingPass> getBoardingPass(@PathVariable Long checkInId,
                                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getBoardingPass(checkInId, userDetails.getId()));
    }
}
