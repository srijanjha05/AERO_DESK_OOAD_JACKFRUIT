CREATE DATABASE IF NOT EXISTS aerodesk_airline_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aerodesk_airline_db;

CREATE TABLE IF NOT EXISTS ad_users (
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('PASSENGER','EMPLOYEE','AIRPORT_MANAGER','ADMIN') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_ad_users_email (email),
    KEY idx_ad_users_role (role),
    KEY idx_ad_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_passengers (
    user_id BIGINT NOT NULL,
    passport_number VARCHAR(50),
    nationality VARCHAR(50),
    date_of_birth DATE DEFAULT NULL,
    gender VARCHAR(20) DEFAULT NULL,
    address_line VARCHAR(255) DEFAULT NULL,
    emergency_contact_name VARCHAR(120) DEFAULT NULL,
    emergency_contact_phone VARCHAR(30) DEFAULT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_ad_passengers_passport_number (passport_number),
    CONSTRAINT fk_ad_passengers_user
        FOREIGN KEY (user_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_employees (
    user_id BIGINT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_ad_employees_employee_id (employee_id),
    CONSTRAINT fk_ad_employees_user
        FOREIGN KEY (user_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_airport_managers (
    user_id BIGINT NOT NULL,
    airport_code VARCHAR(10),
    PRIMARY KEY (user_id),
    KEY idx_ad_airport_managers_airport_code (airport_code),
    CONSTRAINT fk_ad_airport_managers_user
        FOREIGN KEY (user_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_admins (
    user_id BIGINT NOT NULL,
    admin_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_ad_admins_admin_id (admin_id),
    CONSTRAINT fk_ad_admins_user
        FOREIGN KEY (user_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_airports (
    airport_id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    PRIMARY KEY (airport_id),
    UNIQUE KEY uk_ad_airports_code (code),
    KEY idx_ad_airports_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_aircraft (
    aircraft_id BIGINT NOT NULL AUTO_INCREMENT,
    model VARCHAR(100) NOT NULL,
    reg_number VARCHAR(50) NOT NULL,
    total_seats INT NOT NULL,
    PRIMARY KEY (aircraft_id),
    UNIQUE KEY uk_ad_aircraft_reg_number (reg_number),
    CONSTRAINT chk_ad_aircraft_total_seats CHECK (total_seats > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_seats (
    seat_id BIGINT NOT NULL AUTO_INCREMENT,
    aircraft_id BIGINT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    class_type ENUM('ECONOMY','BUSINESS','FIRST') NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (seat_id),
    UNIQUE KEY uk_ad_seats_aircraft_seat_number (aircraft_id, seat_number),
    KEY idx_ad_seats_aircraft_id (aircraft_id),
    KEY idx_ad_seats_class_type (class_type),
    KEY idx_ad_seats_is_available (is_available),
    CONSTRAINT fk_ad_seats_aircraft
        FOREIGN KEY (aircraft_id) REFERENCES ad_aircraft(aircraft_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_flights (
    flight_id BIGINT NOT NULL AUTO_INCREMENT,
    flight_number VARCHAR(20) NOT NULL,
    origin_airport_id BIGINT NOT NULL,
    destination_airport_id BIGINT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    status ENUM('SCHEDULED','DELAYED','CANCELLED','BOARDING','DEPARTED','ARRIVED') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    aircraft_id BIGINT NOT NULL,
    PRIMARY KEY (flight_id),
    UNIQUE KEY uk_ad_flights_flight_number (flight_number),
    KEY idx_ad_flights_origin_airport_id (origin_airport_id),
    KEY idx_ad_flights_destination_airport_id (destination_airport_id),
    KEY idx_ad_flights_departure_time (departure_time),
    KEY idx_ad_flights_status (status),
    KEY idx_ad_flights_aircraft_id (aircraft_id),
    CONSTRAINT chk_ad_flights_price CHECK (price >= 0),
    CONSTRAINT chk_ad_flights_departure_arrival CHECK (arrival_time > departure_time),
    CONSTRAINT fk_ad_flights_origin_airport
        FOREIGN KEY (origin_airport_id) REFERENCES ad_airports(airport_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_flights_destination_airport
        FOREIGN KEY (destination_airport_id) REFERENCES ad_airports(airport_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_flights_aircraft
        FOREIGN KEY (aircraft_id) REFERENCES ad_aircraft(aircraft_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_bookings (
    booking_id BIGINT NOT NULL AUTO_INCREMENT,
    pnr_code VARCHAR(6) NOT NULL,
    passenger_id BIGINT NOT NULL,
    flight_id BIGINT NOT NULL,
    booking_date DATETIME NOT NULL,
    status ENUM('PAYMENT_PENDING','CONFIRMED','CANCELLED') NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    traveler_name VARCHAR(120) NOT NULL,
    traveler_date_of_birth DATE DEFAULT NULL,
    traveler_gender VARCHAR(20) NOT NULL,
    traveler_email VARCHAR(120) NOT NULL,
    traveler_phone VARCHAR(30) NOT NULL,
    traveler_nationality VARCHAR(50) DEFAULT NULL,
    traveler_passport_number VARCHAR(50) DEFAULT NULL,
    created_by_employee_id BIGINT DEFAULT NULL,
    PRIMARY KEY (booking_id),
    UNIQUE KEY uk_ad_bookings_pnr_code (pnr_code),
    KEY idx_ad_bookings_passenger_id (passenger_id),
    KEY idx_ad_bookings_flight_id (flight_id),
    KEY idx_ad_bookings_status (status),
    KEY idx_ad_bookings_created_by_employee_id (created_by_employee_id),
    CONSTRAINT chk_ad_bookings_total_amount CHECK (total_amount >= 0),
    CONSTRAINT fk_ad_bookings_passenger
        FOREIGN KEY (passenger_id) REFERENCES ad_users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_bookings_flight
        FOREIGN KEY (flight_id) REFERENCES ad_flights(flight_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_bookings_created_by_employee
        FOREIGN KEY (created_by_employee_id) REFERENCES ad_users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_booking_seats (
    booking_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    PRIMARY KEY (booking_id, seat_id),
    KEY idx_ad_booking_seats_seat_id (seat_id),
    CONSTRAINT fk_ad_booking_seats_booking
        FOREIGN KEY (booking_id) REFERENCES ad_bookings(booking_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_booking_seats_seat
        FOREIGN KEY (seat_id) REFERENCES ad_seats(seat_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_payments (
    payment_id BIGINT NOT NULL AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CARD','UPI','CASH') NOT NULL,
    status ENUM('PENDING','SUCCESS','FAILED') NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    paid_at DATETIME DEFAULT NULL,
    PRIMARY KEY (payment_id),
    UNIQUE KEY uk_ad_payments_transaction_id (transaction_id),
    KEY idx_ad_payments_booking_id (booking_id),
    KEY idx_ad_payments_status (status),
    CONSTRAINT chk_ad_payments_amount CHECK (amount >= 0),
    CONSTRAINT fk_ad_payments_booking
        FOREIGN KEY (booking_id) REFERENCES ad_bookings(booking_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_refunds (
    refund_id BIGINT NOT NULL AUTO_INCREMENT,
    payment_id BIGINT NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    status ENUM('REQUESTED','APPROVED','REJECTED','PROCESSED') NOT NULL,
    request_date DATE NOT NULL,
    reason VARCHAR(500),
    processed_by BIGINT DEFAULT NULL,
    PRIMARY KEY (refund_id),
    KEY idx_ad_refunds_payment_id (payment_id),
    KEY idx_ad_refunds_status (status),
    KEY idx_ad_refunds_processed_by (processed_by),
    CONSTRAINT chk_ad_refunds_refund_amount CHECK (refund_amount >= 0),
    CONSTRAINT fk_ad_refunds_payment
        FOREIGN KEY (payment_id) REFERENCES ad_payments(payment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_refunds_processed_by
        FOREIGN KEY (processed_by) REFERENCES ad_users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_check_ins (
    check_in_id BIGINT NOT NULL AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    check_in_time DATETIME NOT NULL,
    method ENUM('WEB','COUNTER') NOT NULL,
    PRIMARY KEY (check_in_id),
    UNIQUE KEY uk_ad_check_ins_booking_id (booking_id),
    CONSTRAINT fk_ad_check_ins_booking
        FOREIGN KEY (booking_id) REFERENCES ad_bookings(booking_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_boarding_passes (
    boarding_pass_id BIGINT NOT NULL AUTO_INCREMENT,
    check_in_id BIGINT NOT NULL,
    gate VARCHAR(10),
    boarding_time DATETIME NOT NULL,
    barcode_data VARCHAR(500) NOT NULL,
    PRIMARY KEY (boarding_pass_id),
    UNIQUE KEY uk_ad_boarding_passes_check_in_id (check_in_id),
    CONSTRAINT fk_ad_boarding_passes_check_in
        FOREIGN KEY (check_in_id) REFERENCES ad_check_ins(check_in_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_otps (
    otp_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (otp_id),
    KEY idx_ad_otps_user_id (user_id),
    KEY idx_ad_otps_expires_at (expires_at),
    KEY idx_ad_otps_is_used (is_used),
    CONSTRAINT fk_ad_otps_user
        FOREIGN KEY (user_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_notifications (
    notification_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (notification_id),
    KEY idx_ad_notifications_user_id (user_id),
    KEY idx_ad_notifications_is_read (is_read),
    KEY idx_ad_notifications_created_at (created_at),
    CONSTRAINT fk_ad_notifications_user
        FOREIGN KEY (user_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_audit_logs (
    log_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    action VARCHAR(200) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL,
    ip_address VARCHAR(50),
    PRIMARY KEY (log_id),
    KEY idx_ad_audit_logs_user_id (user_id),
    KEY idx_ad_audit_logs_entity_type (entity_type),
    KEY idx_ad_audit_logs_entity_id (entity_id),
    KEY idx_ad_audit_logs_timestamp (timestamp),
    CONSTRAINT fk_ad_audit_logs_user
        FOREIGN KEY (user_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ad_seat_holds (
    hold_id BIGINT NOT NULL AUTO_INCREMENT,
    seat_id BIGINT NOT NULL,
    booking_id BIGINT DEFAULT NULL,
    passenger_id BIGINT NOT NULL,
    held_until DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (hold_id),
    KEY idx_ad_seat_holds_seat_id (seat_id),
    KEY idx_ad_seat_holds_booking_id (booking_id),
    KEY idx_ad_seat_holds_passenger_id (passenger_id),
    KEY idx_ad_seat_holds_held_until (held_until),
    KEY idx_ad_seat_holds_is_active (is_active),
    CONSTRAINT fk_ad_seat_holds_seat
        FOREIGN KEY (seat_id) REFERENCES ad_seats(seat_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_seat_holds_booking
        FOREIGN KEY (booking_id) REFERENCES ad_bookings(booking_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ad_seat_holds_passenger
        FOREIGN KEY (passenger_id) REFERENCES ad_users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
