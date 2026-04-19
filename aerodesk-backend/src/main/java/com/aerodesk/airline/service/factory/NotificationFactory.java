package com.aerodesk.airline.service.factory;

import com.aerodesk.airline.entity.Notification;
import com.aerodesk.airline.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificationFactory {

    public Notification create(User recipient, String message, String type) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notification;
    }
}
