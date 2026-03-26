package com.aerodesk.airline.entity;

import com.aerodesk.airline.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ad_bookings")
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long id;

    @Column(name = "pnr_code", nullable = false, unique = true, length = 6)
    private String pnrCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "passenger_id", nullable = false)
    private Passenger passenger;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "traveler_name", nullable = false, length = 120)
    private String travelerName;

    @Column(name = "traveler_date_of_birth")
    private LocalDate travelerDateOfBirth;

    @Column(name = "traveler_gender", nullable = false, length = 20)
    private String travelerGender;

    @Column(name = "traveler_email", nullable = false, length = 120)
    private String travelerEmail;

    @Column(name = "traveler_phone", nullable = false, length = 30)
    private String travelerPhone;

    @Column(name = "traveler_nationality", length = 50)
    private String travelerNationality;

    @Column(name = "traveler_passport_number", length = 50)
    private String travelerPassportNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_employee_id")
    private Employee createdByEmployee;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "ad_booking_seats",
        joinColumns = @JoinColumn(name = "booking_id"),
        inverseJoinColumns = @JoinColumn(name = "seat_id")
    )
    private List<Seat> seats = new ArrayList<>();
}
