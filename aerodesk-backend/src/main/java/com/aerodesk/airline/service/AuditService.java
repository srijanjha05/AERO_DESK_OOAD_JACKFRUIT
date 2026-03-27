package com.aerodesk.airline.service;

import com.aerodesk.airline.entity.AuditLog;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.repository.AuditLogRepository;
import com.aerodesk.airline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(Long userId, String action, String entityType, String entityId, String ipAddress) {
        log(userId, action, entityType, entityId, ipAddress, "SUCCESS");
    }

    public void log(Long userId, String action, String entityType, String entityId, String ipAddress, String outcome) {
        if (userId == null) {
            return;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }

        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setTimestamp(LocalDateTime.now());
        log.setIpAddress(ipAddress == null ? "SYSTEM" : ipAddress);
        log.setOutcome(outcome);
        auditLogRepository.save(log);
    }
}
