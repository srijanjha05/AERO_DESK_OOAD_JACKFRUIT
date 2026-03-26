package com.aerodesk.airline.scheduler;

import com.aerodesk.airline.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SeatHoldExpiryScheduler {

    private final BookingService bookingService;

    @Scheduled(fixedRate = 60000)
    public void expireSeatHolds() {
        bookingService.expireSeatHolds();
    }
}
