package com.aerodesk.airline.dto.booking;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BookingRequest {
    private Long flightId;
    private List<Long> seatIds;
    private Long passengerId;
    private String travelerName;
    private LocalDate travelerDateOfBirth;
    private String travelerGender;
    private String travelerEmail;
    private String travelerPhone;
    private String travelerNationality;
    private String travelerPassportNumber;
}
