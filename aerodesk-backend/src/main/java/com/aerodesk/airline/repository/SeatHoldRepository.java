package com.aerodesk.airline.repository;

import com.aerodesk.airline.entity.SeatHold;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {
    Optional<SeatHold> findBySeatIdAndIsActiveTrue(Long seatId);
    List<SeatHold> findByHeldUntilBeforeAndIsActiveTrue(LocalDateTime now);
    List<SeatHold> findByPassengerIdAndIsActiveTrue(Long passengerId);
}
