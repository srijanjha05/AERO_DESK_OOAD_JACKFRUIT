package com.aerodesk.airline.dto.admin;

import com.aerodesk.airline.entity.enums.Role;
import lombok.Data;

@Data
public class RoleAssignmentRequest {
    private Long userId;
    private Role role;
}
