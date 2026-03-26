package com.aerodesk.airline.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ad_admins")
@Getter
@Setter
public class Admin extends User {

    @Column(name = "admin_id", nullable = false, unique = true, length = 50)
    private String adminId;
}
