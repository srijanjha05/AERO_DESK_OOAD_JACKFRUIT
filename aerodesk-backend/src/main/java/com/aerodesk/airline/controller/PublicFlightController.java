package com.aerodesk.airline.controller;

import com.aerodesk.airline.entity.Flight;
import com.aerodesk.airline.entity.Seat;
import com.aerodesk.airline.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class PublicFlightController {

    private final BookingService bookingService;

    @GetMapping("/search")
    public ResponseEntity<List<Flight>> searchFlights(@RequestParam String from, @RequestParam String to, @RequestParam String date) {
        return ResponseEntity.ok(bookingService.searchFlights(from, to, date));
    }

    @PreAuthorize("hasRole('PASSENGER') or hasRole('EMPLOYEE') or hasRole('ADMIN') or hasRole('AIRPORT_MANAGER')")
    @GetMapping("/{id}/seats")
    public ResponseEntity<List<Seat>> getAvailableSeats(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getAvailableSeats(id));
    }
}
