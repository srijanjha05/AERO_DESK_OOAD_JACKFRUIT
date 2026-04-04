package com.aerodesk.airline.service;

import com.aerodesk.airline.dto.manager.AircraftRequest;
import com.aerodesk.airline.dto.manager.AirportRequest;
import com.aerodesk.airline.dto.manager.FlightRequest;
import com.aerodesk.airline.entity.Aircraft;
import com.aerodesk.airline.entity.Airport;
import com.aerodesk.airline.entity.Flight;
import com.aerodesk.airline.entity.Notification;
import com.aerodesk.airline.entity.Refund;
import com.aerodesk.airline.entity.Seat;
import com.aerodesk.airline.entity.enums.FlightStatus;
import com.aerodesk.airline.entity.enums.RefundStatus;
import com.aerodesk.airline.entity.enums.SeatClass;
import com.aerodesk.airline.entity.enums.BookingStatus;
import com.aerodesk.airline.repository.AircraftRepository;
import com.aerodesk.airline.repository.AirportRepository;
import com.aerodesk.airline.repository.BookingRepository;
import com.aerodesk.airline.repository.FlightRepository;
import com.aerodesk.airline.repository.RefundRepository;
import com.aerodesk.airline.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagerService {

    private final AirportRepository airportRepository;
    private final AircraftRepository aircraftRepository;
    private final SeatRepository seatRepository;
    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final RefundRepository refundRepository;
    private final NotificationService notificationService;
    private final BookingService bookingService;
    private final AuditService auditService;

    public List<Airport> listAirports() {
        return airportRepository.findAll();
    }

    public List<Aircraft> listAircraft() {
        return aircraftRepository.findAll();
    }

    @Transactional
    public Airport createAirport(AirportRequest request, Long actingUserId) {
        airportRepository.findByCodeIgnoreCase(request.getCode()).ifPresent(existing -> {
            throw new RuntimeException("Airport code already exists");
        });

        Airport airport = new Airport();
        airport.setName(request.getName());
        airport.setCode(request.getCode().toUpperCase());
        airport.setCity(request.getCity());
        Airport saved = airportRepository.save(airport);
        auditService.log(actingUserId, "AIRPORT_CREATED", "AIRPORT", saved.getId().toString(), "SYSTEM");
        return saved;
    }

    @Transactional
    public Aircraft createAircraft(AircraftRequest request, Long actingUserId) {
        aircraftRepository.findByRegistrationNumber(request.getRegistrationNumber()).ifPresent(existing -> {
            throw new RuntimeException("Aircraft registration already exists");
        });

        int totalRequestedSeats = defaultValue(request.getEconomySeats()) + defaultValue(request.getBusinessSeats()) + defaultValue(request.getFirstClassSeats());
        if (request.getTotalSeats() <= 0) {
            throw new RuntimeException("Aircraft must have a capacity greater than 0");
        }
        if (!request.getTotalSeats().equals(totalRequestedSeats)) {
            throw new RuntimeException("Seat class totals must equal total seats");
        }

        Aircraft aircraft = new Aircraft();
        aircraft.setModel(request.getModel());
        aircraft.setRegistrationNumber(request.getRegistrationNumber());
        aircraft.setTotalSeats(request.getTotalSeats());
        aircraft = aircraftRepository.save(aircraft);

        int seatIndex = 1;
        seatIndex = createSeats(aircraft, defaultValue(request.getFirstClassSeats()), SeatClass.FIRST, seatIndex);
        seatIndex = createSeats(aircraft, defaultValue(request.getBusinessSeats()), SeatClass.BUSINESS, seatIndex);
        createSeats(aircraft, defaultValue(request.getEconomySeats()), SeatClass.ECONOMY, seatIndex);

        auditService.log(actingUserId, "AIRCRAFT_CREATED", "AIRCRAFT", aircraft.getId().toString(), "SYSTEM");
        return aircraft;
    }

    @Transactional
    public Flight createFlight(FlightRequest request, Long actingUserId) {
        if (flightRepository.existsByAircraftIdAndDepartureTimeLessThanAndArrivalTimeGreaterThan(
                request.getAircraftId(), request.getArrivalTime(), request.getDepartureTime())) {
            throw new RuntimeException("Aircraft is already scheduled for a flight during this time window");
        }
        if (request.getArrivalTime().isBefore(request.getDepartureTime())) {
            throw new RuntimeException("Arrival time cannot be before departure time");
        }

        Flight flight = new Flight();
        flight.setFlightNumber(request.getFlightNumber());
        flight.setOriginAirport(airportRepository.findById(request.getOriginAirportId()).orElseThrow());
        flight.setDestinationAirport(airportRepository.findById(request.getDestinationAirportId()).orElseThrow());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setPrice(request.getPrice());
        flight.setAircraft(aircraftRepository.findById(request.getAircraftId()).orElseThrow());
        flight.setStatus(FlightStatus.SCHEDULED);
        Flight saved = flightRepository.save(flight);
        auditService.log(actingUserId, "FLIGHT_CREATED", "FLIGHT", saved.getId().toString(), "SYSTEM");
        return saved;
    }

    @Transactional
    public Flight updateFlight(Long id, FlightRequest request, Long actingUserId) {
        if (flightRepository.existsByAircraftIdAndDepartureTimeLessThanAndArrivalTimeGreaterThanAndIdNot(
                request.getAircraftId(), request.getArrivalTime(), request.getDepartureTime(), id)) {
            throw new RuntimeException("Aircraft is already scheduled for a flight during this time window");
        }
        if (request.getArrivalTime().isBefore(request.getDepartureTime())) {
            throw new RuntimeException("Arrival time cannot be before departure time");
        }

        Flight flight = flightRepository.findById(id).orElseThrow();
        flight.setFlightNumber(request.getFlightNumber());
        flight.setOriginAirport(airportRepository.findById(request.getOriginAirportId()).orElseThrow());
        flight.setDestinationAirport(airportRepository.findById(request.getDestinationAirportId()).orElseThrow());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setPrice(request.getPrice());
        flight.setAircraft(aircraftRepository.findById(request.getAircraftId()).orElseThrow());
        Flight saved = flightRepository.save(flight);
        auditService.log(actingUserId, "FLIGHT_UPDATED", "FLIGHT", saved.getId().toString(), "SYSTEM");
        return saved;
    }

    @Transactional
    public Flight updateFlightStatus(Long id, String status, String reason, Long actingUserId) {
        Flight flight = flightRepository.findById(id).orElseThrow();
        flight.setStatus(FlightStatus.valueOf(status.toUpperCase()));
        if (reason != null && !reason.isBlank()) {
            flight.setStatusReason(reason);
        }
        Flight saved = flightRepository.save(flight);

        if (saved.getStatus() == FlightStatus.CANCELLED) {
            bookingService.handleFlightCancellationRefunds(saved, actingUserId);
        } else if (saved.getStatus() == FlightStatus.DELAYED) {
            // FR-5.5 / FR-10.3 notify confirmed passengers of delay
            List<Long> passengerIds = bookingRepository.findByFlightId(saved.getId()).stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                    .map(b -> b.getPassenger().getId())
                    .distinct()
                    .toList();
            if (!passengerIds.isEmpty()) {
                String msg = "Flight " + saved.getFlightNumber() + " has been delayed." +
                        (reason != null && !reason.isBlank() ? " Reason: " + reason : "");
                notificationService.sendBulk(msg, "FLIGHT_DELAYED", passengerIds, null);
            }
        }

        auditService.log(actingUserId, "FLIGHT_STATUS_UPDATED", "FLIGHT", saved.getId().toString(), "SYSTEM");
        return saved;
    }

    public List<Refund> getPendingRefunds() {
        return refundRepository.findByStatus(RefundStatus.REQUESTED);
    }

    @Transactional
    public Refund approveRefund(Long refundId, String reason, Long actingUserId) {
        Refund refund = refundRepository.findById(refundId).orElseThrow();
        refund.setStatus(RefundStatus.APPROVED);
        refund.setReason(reason == null || reason.isBlank() ? "Approved by airport manager" : reason);
        refund = refundRepository.save(refund);
        // FR-10.4 notify passenger of refund approval
        Long passengerId = refund.getPayment().getBooking().getPassenger().getId();
        notificationService.sendBulk(
                "Your refund of ₹" + refund.getRefundAmount() + " for booking PNR " +
                        refund.getPayment().getBooking().getPnrCode() + " has been approved and will be processed shortly.",
                "REFUND_APPROVED",
                java.util.List.of(passengerId), null
        );
        auditService.log(actingUserId, "REFUND_APPROVED", "REFUND", refund.getId().toString(), "SYSTEM");
        return refund;
    }

    @Transactional
    public Refund rejectRefund(Long refundId, String reason, Long actingUserId) {
        Refund refund = refundRepository.findById(refundId).orElseThrow();
        refund.setStatus(RefundStatus.REJECTED);
        refund.setReason(reason);
        refund = refundRepository.save(refund);
        // FR-10.4 notify passenger of refund rejection
        Long passengerId = refund.getPayment().getBooking().getPassenger().getId();
        notificationService.sendBulk(
                "Your refund request for booking PNR " + refund.getPayment().getBooking().getPnrCode() +
                        " has been rejected." + (reason != null && !reason.isBlank() ? " Reason: " + reason : ""),
                "REFUND_REJECTED",
                java.util.List.of(passengerId), null
        );
        auditService.log(actingUserId, "REFUND_REJECTED", "REFUND", refund.getId().toString(), "SYSTEM");
        return refund;
    }

    @Transactional
    public List<Notification> sendBulkNotifications(String message, String type, List<Long> userIds, List<com.aerodesk.airline.entity.enums.Role> roles, Long actingUserId) {
        List<Notification> notifications = notificationService.sendBulk(message, type, userIds, roles);
        auditService.log(actingUserId, "BULK_NOTIFICATION_SENT", "NOTIFICATION", String.valueOf(notifications.size()), "SYSTEM");
        return notifications;
    }

    private int createSeats(Aircraft aircraft, int count, SeatClass seatClass, int startIndex) {
        int current = startIndex;
        for (int i = 0; i < count; i++) {
            Seat seat = new Seat();
            seat.setAircraft(aircraft);
            seat.setSeatNumber(formatSeatNumber(current++));
            seat.setClassType(seatClass);
            seat.setIsAvailable(true);
            seatRepository.save(seat);
        }
        return current;
    }

    private int defaultValue(Integer value) {
        return value == null ? 0 : value;
    }

    private String formatSeatNumber(int index) {
        int row = ((index - 1) / 6) + 1;
        char column = (char) ('A' + ((index - 1) % 6));
        return row + String.valueOf(column);
    }
}
