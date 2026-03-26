package com.aerodesk.airline.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ad_aircraft")
@Getter
@Setter
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "aircraft_id")
    private Long id;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "reg_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;
}
