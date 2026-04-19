package com.aerodesk.airline.service.factory;

import com.aerodesk.airline.dto.booking.BookingRequest;
import com.aerodesk.airline.entity.Booking;
import com.aerodesk.airline.entity.Employee;
import com.aerodesk.airline.entity.Flight;
import com.aerodesk.airline.entity.Passenger;
import com.aerodesk.airline.entity.Seat;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.entity.enums.BookingStatus;
import com.aerodesk.airline.entity.enums.Role;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class BookingFactory {

    public Booking createBooking(String pnrCode, Flight flight, Passenger passenger,
                                  BookingRequest request, List<Seat> selectedSeats, User actingUser) {
        Booking booking = new Booking();
        booking.setPnrCode(pnrCode);
        booking.setFlight(flight);
        booking.setPassenger(passenger);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(BookingStatus.PAYMENT_PENDING);
        booking.setTotalAmount(flight.getPrice().multiply(BigDecimal.valueOf(selectedSeats.size())));
        booking.setTravelerName(requiredString(request.getTravelerName(), "Traveler name is required"));
        booking.setTravelerDateOfBirth(requiredDate(request.getTravelerDateOfBirth(), "Traveler date of birth is required"));
        booking.setTravelerGender(requiredString(request.getTravelerGender(), "Traveler gender is required"));
        booking.setTravelerEmail(requiredString(request.getTravelerEmail(), "Traveler email is required"));
        booking.setTravelerPhone(requiredString(request.getTravelerPhone(), "Traveler phone is required"));
        booking.setTravelerNationality(request.getTravelerNationality());
        booking.setTravelerPassportNumber(request.getTravelerPassportNumber());
        if (actingUser.getRole() == Role.EMPLOYEE) {
            booking.setCreatedByEmployee((Employee) actingUser);
        }
        booking.setSeats(selectedSeats);
        return booking;
    }

    private String requiredString(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException(message);
        }
        return value.trim();
    }

    private LocalDate requiredDate(LocalDate value, String message) {
        if (value == null) {
            throw new RuntimeException(message);
        }
        return value;
    }
}
