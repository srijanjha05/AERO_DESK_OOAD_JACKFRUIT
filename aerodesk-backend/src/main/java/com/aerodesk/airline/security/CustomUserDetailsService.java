package com.aerodesk.airline.security;

import com.aerodesk.airline.entity.Admin;
import com.aerodesk.airline.entity.AirportManager;
import com.aerodesk.airline.entity.Employee;
import com.aerodesk.airline.entity.Passenger;
import com.aerodesk.airline.entity.User;
import com.aerodesk.airline.repository.AdminRepository;
import com.aerodesk.airline.repository.AirportManagerRepository;
import com.aerodesk.airline.repository.EmployeeRepository;
import com.aerodesk.airline.repository.PassengerRepository;
import com.aerodesk.airline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PassengerRepository passengerRepository;
    private final EmployeeRepository employeeRepository;
    private final AirportManagerRepository airportManagerRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = resolveUser(username);
        return new CustomUserDetails(user);
    }

    private User resolveUser(String username) {
        Passenger passenger = passengerRepository.findByEmail(username).orElse(null);
        if (passenger != null) {
            return passenger;
        }

        User user = userRepository.findByEmail(username).orElse(null);
        if (user != null) {
            return user;
        }

        Employee employee = employeeRepository.findByEmployeeId(username).orElse(null);
        if (employee != null) {
            return employee;
        }

        Admin admin = adminRepository.findByAdminId(username).orElse(null);
        if (admin != null) {
            return admin;
        }

        AirportManager manager = airportManagerRepository.findAll().stream()
                .filter(candidate -> username.equalsIgnoreCase(candidate.getEmail()))
                .findFirst()
                .orElse(null);
        if (manager != null) {
            return manager;
        }

        throw new UsernameNotFoundException("User not found with identifier: " + username);
    }
}
