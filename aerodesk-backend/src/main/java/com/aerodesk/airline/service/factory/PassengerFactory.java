package com.aerodesk.airline.service.factory;

import com.aerodesk.airline.dto.auth.RegisterRequest;
import com.aerodesk.airline.entity.Passenger;
import com.aerodesk.airline.entity.enums.Role;
import org.springframework.stereotype.Component;

@Component
public class PassengerFactory {

    public Passenger createPassenger(RegisterRequest request, String encodedPassword) {
        Passenger passenger = new Passenger();
        passenger.setName(request.getName());
        passenger.setEmail(request.getEmail());
        passenger.setPassword(encodedPassword);
        passenger.setPhone(request.getPhone());
        passenger.setRole(Role.PASSENGER);
        passenger.setPassportNumber(request.getPassportNumber());
        passenger.setNationality(request.getNationality());
        passenger.setDateOfBirth(request.getDateOfBirth());
        passenger.setGender(request.getGender());
        passenger.setAddressLine(request.getAddressLine());
        passenger.setEmergencyContactName(request.getEmergencyContactName());
        passenger.setEmergencyContactPhone(request.getEmergencyContactPhone());
        return passenger;
    }
}
