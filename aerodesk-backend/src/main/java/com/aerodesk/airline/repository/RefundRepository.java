package com.aerodesk.airline.repository;

import com.aerodesk.airline.entity.Refund;
import com.aerodesk.airline.entity.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByStatus(RefundStatus status);
}
