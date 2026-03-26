package com.aerodesk.airline.dto.manager;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FlightRequest {
    private String flightNumber;
    private Long originAirportId;
    private Long destinationAirportId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BigDecimal price;
    private Long aircraftId;
}
