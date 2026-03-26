package com.aerodesk.airline.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ad_airport_managers")
@Getter
@Setter
public class AirportManager extends User {

    @Column(name = "airport_code", length = 10)
    private String airportCode;
}
