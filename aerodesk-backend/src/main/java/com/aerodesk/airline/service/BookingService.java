package com.aerodesk.airline.service;

import com.aerodesk.airline.dto.booking.BookingRequest;
import com.aerodesk.airline.dto.booking.PaymentRequest;
import com.aerodesk.airline.entity.BoardingPass;
import com.aerodesk.airline.entity.Booking;
import com.aerodesk.airline.entity.CheckIn;
import com.aerodesk.airline.entity.Flight;
import com.aerodesk.airline.entity.Invoice;
import com.aerodesk.airline.entity.Passenger;
import com.aerodesk.airline.entity.Payment;
import com.aerodesk.airline.entity.Refund;
import com.aerodesk.airline.entity.Seat;
import com.aerodesk.airline.entity.SeatHold;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.entity.enums.BookingStatus;
import com.aerodesk.airline.entity.enums.CheckInMethod;
import com.aerodesk.airline.entity.enums.FlightStatus;
import com.aerodesk.airline.entity.enums.PaymentMethod;
import com.aerodesk.airline.entity.enums.PaymentStatus;
import com.aerodesk.airline.entity.enums.RefundStatus;
import com.aerodesk.airline.entity.enums.Role;
import com.aerodesk.airline.repository.BoardingPassRepository;
import com.aerodesk.airline.repository.BookingRepository;
import com.aerodesk.airline.repository.CheckInRepository;
import com.aerodesk.airline.repository.FlightRepository;
import com.aerodesk.airline.repository.PassengerRepository;
import com.aerodesk.airline.repository.PaymentRepository;
import com.aerodesk.airline.repository.RefundRepository;
import com.aerodesk.airline.repository.SeatHoldRepository;
import com.aerodesk.airline.repository.SeatRepository;
import com.aerodesk.airline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PassengerRepository passengerRepository;
    private final SeatHoldRepository seatHoldRepository;
    private final PaymentRepository paymentRepository;
    private final CheckInRepository checkInRepository;
    private final BoardingPassRepository boardingPassRepository;
    private final RefundRepository refundRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final com.aerodesk.airline.repository.InvoiceRepository invoiceRepository;

    @Value("${seat.hold.minutes}")
    private int seatHoldMinutes;

    @Value("${checkin.window.hours.before}")
    private int checkInWindowHoursBefore;

    @Value("${checkin.window.hours.cutoff}")
    private int checkInWindowHoursCutoff;

    public List<Flight> searchFlights(String from, String to, String date) {
        LocalDate travelDate = LocalDate.parse(date);
        return flightRepository.findByOriginAirportCodeIgnoreCaseAndDestinationAirportCodeIgnoreCaseAndDepartureTimeBetween(
                from,
                to,
                travelDate.atStartOfDay(),
                LocalDateTime.of(travelDate, LocalTime.MAX)
        );
    }

    public List<Seat> getAvailableSeats(Long flightId) {
        Flight flight = flightRepository.findById(flightId).orElseThrow();
        return seatRepository.findByAircraftId(flight.getAircraft().getId());
    }

    @Transactional
    public Booking createBooking(BookingRequest request, Long actingUserId) {
        Flight flight = flightRepository.findById(request.getFlightId()).orElseThrow();
        Long effectivePassengerId = request.getPassengerId() != null ? request.getPassengerId() : actingUserId;
        Passenger passenger = passengerRepository.findById(effectivePassengerId).orElseThrow();
        User actingUser = userRepository.findById(actingUserId).orElseThrow();

        if (flight.getStatus() == FlightStatus.CANCELLED) {
            throw new RuntimeException("Cannot book a cancelled flight");
        }

        List<Seat> selectedSeats = seatRepository.findAllById(request.getSeatIds());
        if (selectedSeats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("One or more seats were not found");
        }

        for (Seat seat : selectedSeats) {
            if (!seat.getAircraft().getId().equals(flight.getAircraft().getId())) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " does not belong to the selected flight aircraft");
            }
            Optional<SeatHold> activeHold = seatHoldRepository.findBySeatIdAndIsActiveTrue(seat.getId());
            if (!Boolean.TRUE.equals(seat.getIsAvailable()) || activeHold.isPresent()) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is unavailable");
            }
        }

        Booking booking = new Booking();
        booking.setPnrCode(generateUniquePnr());
        booking.setFlight(flight);
        booking.setPassenger(passenger);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(BookingStatus.PAYMENT_PENDING);
        booking.setTotalAmount(flight.getPrice().multiply(BigDecimal.valueOf(selectedSeats.size())));
        booking.setTravelerName(requiredValue(request.getTravelerName(), "Traveler name is required"));
        booking.setTravelerDateOfBirth(requiredValue(request.getTravelerDateOfBirth(), "Traveler date of birth is required"));
        booking.setTravelerGender(requiredValue(request.getTravelerGender(), "Traveler gender is required"));
        booking.setTravelerEmail(requiredValue(request.getTravelerEmail(), "Traveler email is required"));
        booking.setTravelerPhone(requiredValue(request.getTravelerPhone(), "Traveler phone is required"));
        booking.setTravelerNationality(request.getTravelerNationality());
        booking.setTravelerPassportNumber(request.getTravelerPassportNumber());
        if (actingUser.getRole() == Role.EMPLOYEE) {
            booking.setCreatedByEmployee((com.aerodesk.airline.entity.Employee) actingUser);
        }
        booking.setSeats(selectedSeats);

        passenger.setName(booking.getTravelerName());
        passenger.setPhone(booking.getTravelerPhone());
        passenger.setDateOfBirth(booking.getTravelerDateOfBirth());
        passenger.setGender(booking.getTravelerGender());
        if (request.getTravelerNationality() != null && !request.getTravelerNationality().isBlank()) {
            passenger.setNationality(request.getTravelerNationality());
        }
        if (request.getTravelerPassportNumber() != null && !request.getTravelerPassportNumber().isBlank()) {
            passenger.setPassportNumber(request.getTravelerPassportNumber());
        }
        passengerRepository.save(passenger);

        booking = bookingRepository.save(booking);

        for (Seat seat : selectedSeats) {
            SeatHold hold = new SeatHold();
            hold.setSeat(seat);
            hold.setBooking(booking);
            hold.setPassenger(passenger);
            hold.setHeldUntil(LocalDateTime.now().plusMinutes(seatHoldMinutes));
            hold.setIsActive(true);
            seatHoldRepository.save(hold);

            seat.setIsAvailable(false);
            seatRepository.save(seat);
        }

        auditService.log(actingUserId, "BOOKING_CREATED", "BOOKING", booking.getId().toString(), "SYSTEM");
        return booking;
    }

    @Transactional
    public Payment processPayment(Long bookingId, PaymentRequest request, Long actingUserId) {
        User actingUser = userRepository.findById(actingUserId).orElseThrow();
        Booking booking = actingUser.getRole() == Role.PASSENGER
                ? getOwnedBooking(bookingId, actingUserId)
                : bookingRepository.findById(bookingId).orElseThrow();
        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Booking is not awaiting payment");
        }
        if (request.getAmount().compareTo(booking.getTotalAmount()) < 0) {
            throw new RuntimeException("Insufficient payment amount");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        for (Seat seat : booking.getSeats()) {
            seatHoldRepository.findBySeatIdAndIsActiveTrue(seat.getId()).ifPresent(hold -> {
                hold.setIsActive(false);
                seatHoldRepository.save(hold);
            });
        }

        Invoice invoice = new Invoice();
        invoice.setBooking(booking);
        invoice.setInvoiceNumber("INV-" + booking.getPnrCode() + "-" + LocalDate.now().toString().replace("-", ""));
        invoice.setTotalAmount(booking.getTotalAmount());
        BigDecimal tax = booking.getTotalAmount().multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        invoice.setTaxAmount(tax);
        invoice.setBaseFare(booking.getTotalAmount().subtract(tax));
        invoice.setIssuedAt(LocalDateTime.now());
        invoiceRepository.save(invoice);

        auditService.log(actingUserId, "PAYMENT_SUCCESS", "PAYMENT", payment.getId().toString(), "SYSTEM");
        return payment;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, Long passengerId) {
        Booking booking = getOwnedBooking(bookingId, passengerId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return booking;
        }

        booking.setStatus(BookingStatus.CANCELLED);
        releaseSeats(booking);
        bookingRepository.save(booking);
        createRefundForCancellation(booking, passengerId, "Passenger cancellation");
        auditService.log(passengerId, "BOOKING_CANCELLED", "BOOKING", booking.getId().toString(), "SYSTEM");
        return booking;
    }

    @Transactional
    public CheckIn webCheckIn(Long bookingId, Long passengerId) {
        Booking booking = getOwnedBooking(bookingId, passengerId);
        validateCheckInWindow(booking);
        return createCheckIn(booking, CheckInMethod.WEB, passengerId);
    }

    @Transactional
    public CheckIn counterCheckIn(Long bookingId, Long actingUserId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        validateCheckInWindow(booking);
        return createCheckIn(booking, CheckInMethod.COUNTER, actingUserId);
    }

    public BoardingPass getBoardingPass(Long checkInId, Long userId) {
        BoardingPass boardingPass = boardingPassRepository.findByCheckInId(checkInId).orElseThrow();
        Booking booking = boardingPass.getCheckIn().getBooking();
        boolean authorized = booking.getPassenger().getId().equals(userId)
                || userRepository.findById(userId).map(user -> user.getRole() != Role.PASSENGER).orElse(false);
        if (!authorized) {
            throw new RuntimeException("Not authorized to view this boarding pass");
        }
        return boardingPass;
    }

    public Booking getBooking(Long id, Long actingUserId) {
        User actingUser = userRepository.findById(actingUserId).orElseThrow();
        if (actingUser.getRole() == Role.PASSENGER) {
            return getOwnedBooking(id, actingUserId);
        }
        return bookingRepository.findById(id).orElseThrow();
    }

    public List<Booking> getMyBookings(Long passengerId) {
        return bookingRepository.findByPassengerId(passengerId);
    }

    @Transactional
    public void expireSeatHolds() {
        List<SeatHold> expiredHolds = seatHoldRepository.findByHeldUntilBeforeAndIsActiveTrue(LocalDateTime.now());
        for (SeatHold hold : expiredHolds) {
            hold.setIsActive(false);
            seatHoldRepository.save(hold);

            if (hold.getBooking() != null && hold.getBooking().getStatus() == BookingStatus.PAYMENT_PENDING) {
                hold.getBooking().setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(hold.getBooking());
            }

            hold.getSeat().setIsAvailable(true);
            seatRepository.save(hold.getSeat());
        }
    }

    @Transactional
    public void handleFlightCancellationRefunds(Flight flight, Long actingUserId) {
        List<Booking> bookings = bookingRepository.findByFlightId(flight.getId()).stream()
                .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                .toList();

        for (Booking booking : bookings) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            releaseSeats(booking);
            createRefundForCancellation(booking, actingUserId, "Flight cancelled by airport operations");
        }
    }

    private Booking getOwnedBooking(Long bookingId, Long passengerId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        if (!booking.getPassenger().getId().equals(passengerId)) {
            throw new RuntimeException("Not authorized");
        }
        return booking;
    }

    private void validateCheckInWindow(Booking booking) {
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking is not confirmed");
        }

        LocalDateTime departure = booking.getFlight().getDepartureTime();
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(departure.minusHours(checkInWindowHoursBefore)) || now.isAfter(departure.minusHours(checkInWindowHoursCutoff))) {
            throw new RuntimeException("Check-in is allowed only from "
                    + checkInWindowHoursBefore + " hours before departure until "
                    + checkInWindowHoursCutoff + " hour before departure");
        }

        if (checkInRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new RuntimeException("Booking is already checked in");
        }
    }

    private CheckIn createCheckIn(Booking booking, CheckInMethod method, Long actingUserId) {
        CheckIn checkIn = new CheckIn();
        checkIn.setBooking(booking);
        checkIn.setCheckInTime(LocalDateTime.now());
        checkIn.setMethod(method);
        checkIn = checkInRepository.save(checkIn);

        BoardingPass boardingPass = new BoardingPass();
        boardingPass.setCheckIn(checkIn);
        boardingPass.setGate("G" + ((booking.getFlight().getId() % 20) + 1));
        boardingPass.setBoardingTime(booking.getFlight().getDepartureTime().minusMinutes(45));
        boardingPass.setBarcodeData("BP-" + booking.getPnrCode() + "-" + UUID.randomUUID());
        boardingPassRepository.save(boardingPass);

        auditService.log(actingUserId, "CHECKIN_COMPLETED", "CHECK_IN", checkIn.getId().toString(), "SYSTEM");
        return checkIn;
    }

    private void createRefundForCancellation(Booking booking, Long actingUserId, String reason) {
        paymentRepository.findByBookingId(booking.getId()).ifPresent(payment -> {
            BigDecimal refundPercentage = getRefundPercentage(booking.getFlight().getDepartureTime());
            if (refundPercentage.compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }

            Refund refund = new Refund();
            refund.setPayment(payment);
            refund.setRefundAmount(payment.getAmount().multiply(refundPercentage).setScale(2, RoundingMode.HALF_UP));
            refund.setStatus(RefundStatus.REQUESTED);
            refund.setRequestDate(LocalDate.now());
            refund.setReason(reason);
            refundRepository.save(refund);
            auditService.log(actingUserId, "REFUND_REQUESTED", "REFUND", refund.getId().toString(), "SYSTEM");
        });
    }

    private BigDecimal getRefundPercentage(LocalDateTime departureTime) {
        long hoursUntilDeparture = ChronoUnit.HOURS.between(LocalDateTime.now(), departureTime);
        if (hoursUntilDeparture > 48) {
            return new BigDecimal("0.90");
        }
        if (hoursUntilDeparture >= 24) {
            return new BigDecimal("0.50");
        }
        return BigDecimal.ZERO;
    }

    private void releaseSeats(Booking booking) {
        for (Seat seat : booking.getSeats()) {
            seat.setIsAvailable(true);
            seatRepository.save(seat);
            seatHoldRepository.findBySeatIdAndIsActiveTrue(seat.getId()).ifPresent(hold -> {
                hold.setIsActive(false);
                seatHoldRepository.save(hold);
            });
        }
    }

    private String generateUniquePnr() {
        String pnr;
        do {
            pnr = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        } while (bookingRepository.findByPnrCode(pnr).isPresent());
        return pnr;
    }

    private String requiredValue(String value, String errorMessage) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException(errorMessage);
        }
        return value.trim();
    }

    private LocalDate requiredValue(LocalDate value, String errorMessage) {
        if (value == null) {
            throw new RuntimeException(errorMessage);
        }
        return value;
    }
}
