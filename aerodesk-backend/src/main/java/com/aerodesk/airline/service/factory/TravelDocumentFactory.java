package com.aerodesk.airline.service.factory;

import com.aerodesk.airline.entity.BoardingPass;
import com.aerodesk.airline.entity.Booking;
import com.aerodesk.airline.entity.CheckIn;
import com.aerodesk.airline.entity.enums.CheckInMethod;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class TravelDocumentFactory {

    public CheckIn createCheckIn(Booking booking, CheckInMethod method) {
        CheckIn checkIn = new CheckIn();
        checkIn.setBooking(booking);
        checkIn.setCheckInTime(LocalDateTime.now());
        checkIn.setMethod(method);
        return checkIn;
    }

    public BoardingPass createBoardingPass(CheckIn checkIn, Booking booking) {
        BoardingPass boardingPass = new BoardingPass();
        boardingPass.setCheckIn(checkIn);
        boardingPass.setGate("G" + ((booking.getFlight().getId() % 20) + 1));
        boardingPass.setBoardingTime(booking.getFlight().getDepartureTime().minusMinutes(45));
        boardingPass.setBarcodeData("BP-" + booking.getPnrCode() + "-" + UUID.randomUUID());
        return boardingPass;
    }
}
