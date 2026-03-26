package com.aerodesk.airline.service;

import com.aerodesk.airline.entity.Notification;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.entity.enums.Role;
import com.aerodesk.airline.repository.NotificationRepository;
import com.aerodesk.airline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Notification does not belong to the authenticated user");
        }
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public List<Notification> sendBulk(String message, String type, List<Long> userIds, List<Role> roles) {
        Set<User> recipients = new LinkedHashSet<>();

        if (userIds != null && !userIds.isEmpty()) {
            recipients.addAll(userRepository.findAllById(userIds));
        }

        if (roles != null && !roles.isEmpty()) {
            recipients.addAll(userRepository.findAll().stream()
                    .filter(user -> roles.contains(user.getRole()))
                    .toList());
        }

        if (recipients.isEmpty()) {
            recipients.addAll(userRepository.findAll());
        }

        List<Notification> notifications = new ArrayList<>();
        for (User recipient : recipients) {
            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setMessage(message);
            notification.setType(type);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notifications.add(notificationRepository.save(notification));
        }

        return notifications;
    }
}
