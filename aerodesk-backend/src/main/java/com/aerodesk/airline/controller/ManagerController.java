package com.aerodesk.airline.controller;

import com.aerodesk.airline.dto.manager.*;
import com.aerodesk.airline.entity.*;
import com.aerodesk.airline.security.CustomUserDetails;
import com.aerodesk.airline.service.ManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AIRPORT_MANAGER') or hasRole('ADMIN')")
public class ManagerController {

    private final ManagerService managerService;

    @PostMapping("/airports")
    public ResponseEntity<Airport> createAirport(@RequestBody AirportRequest request,
                                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.createAirport(request, userDetails.getId()));
    }

    @PostMapping("/aircraft")
    public ResponseEntity<Aircraft> createAircraft(@RequestBody AircraftRequest request,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.createAircraft(request, userDetails.getId()));
    }

    @PostMapping("/flights")
    public ResponseEntity<Flight> createFlight(@RequestBody FlightRequest request,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.createFlight(request, userDetails.getId()));
    }

    @PutMapping("/flights/{id}")
    public ResponseEntity<Flight> updateFlight(@PathVariable Long id,
                                               @RequestBody FlightRequest request,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.updateFlight(id, request, userDetails.getId()));
    }

    @PatchMapping("/flights/{id}/status")
    public ResponseEntity<Flight> updateFlightStatus(@PathVariable Long id,
                                                     @RequestBody java.util.Map<String, String> statusBody,
                                                     @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.updateFlightStatus(id, statusBody.get("status"), userDetails.getId()));
    }

    @GetMapping("/refunds")
    public ResponseEntity<List<Refund>> getPendingRefunds() {
        return ResponseEntity.ok(managerService.getPendingRefunds());
    }

    @PatchMapping("/refunds/{id}/approve")
    public ResponseEntity<Refund> approveRefund(@PathVariable Long id,
                                                @RequestBody RefundDecisionRequest request,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.approveRefund(id, request.getReason(), userDetails.getId()));
    }

    @PatchMapping("/refunds/{id}/reject")
    public ResponseEntity<Refund> rejectRefund(@PathVariable Long id,
                                               @RequestBody RefundDecisionRequest request,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.rejectRefund(id, request.getReason(), userDetails.getId()));
    }

    @PostMapping("/notifications/bulk")
    public ResponseEntity<List<Notification>> sendBulkNotifications(@RequestBody BulkNotificationRequest request,
                                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(managerService.sendBulkNotifications(
                request.getMessage(),
                request.getType(),
                request.getUserIds(),
                request.getRoles(),
                userDetails.getId()
        ));
    }
}
