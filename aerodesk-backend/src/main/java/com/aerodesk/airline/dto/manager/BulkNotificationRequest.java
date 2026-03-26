package com.aerodesk.airline.dto.manager;

import com.aerodesk.airline.entity.enums.Role;
import lombok.Data;

import java.util.List;

@Data
public class BulkNotificationRequest {
    private String message;
    private String type;
    private List<Long> userIds;
    private List<Role> roles;
}
