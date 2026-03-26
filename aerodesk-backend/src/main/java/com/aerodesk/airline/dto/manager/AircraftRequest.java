package com.aerodesk.airline.dto.manager;

import lombok.Data;

@Data
public class AircraftRequest {
    private String model;
    private String registrationNumber;
    private Integer totalSeats;
    private Integer economySeats;
    private Integer businessSeats;
    private Integer firstClassSeats;
}
