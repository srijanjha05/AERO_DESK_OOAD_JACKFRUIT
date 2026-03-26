package com.aerodesk.airline.repository;

import com.aerodesk.airline.entity.BoardingPass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BoardingPassRepository extends JpaRepository<BoardingPass, Long> {
    Optional<BoardingPass> findByCheckInId(Long checkInId);
}
