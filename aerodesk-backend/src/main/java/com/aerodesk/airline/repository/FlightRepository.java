package com.aerodesk.airline.repository;

import com.aerodesk.airline.entity.Flight;
import com.aerodesk.airline.entity.enums.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long>, JpaSpecificationExecutor<Flight> {
    List<Flight> findByOriginAirportCodeIgnoreCaseAndDestinationAirportCodeIgnoreCaseAndDepartureTimeBetween(
            String originCode,
            String destinationCode,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Flight> findByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(FlightStatus status);
    boolean existsByAircraftIdAndDepartureTimeLessThanAndArrivalTimeGreaterThan(Long aircraftId, LocalDateTime newArrival, LocalDateTime newDeparture);
    boolean existsByAircraftIdAndDepartureTimeLessThanAndArrivalTimeGreaterThanAndIdNot(Long aircraftId, LocalDateTime newArrival, LocalDateTime newDeparture, Long id);
}
