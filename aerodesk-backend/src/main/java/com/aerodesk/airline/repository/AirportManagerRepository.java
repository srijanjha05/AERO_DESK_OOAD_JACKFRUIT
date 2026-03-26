package com.aerodesk.airline.repository;

import com.aerodesk.airline.entity.AirportManager;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AirportManagerRepository extends JpaRepository<AirportManager, Long> {
}
