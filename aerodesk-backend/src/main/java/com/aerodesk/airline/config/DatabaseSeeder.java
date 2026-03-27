package com.aerodesk.airline.config;

import com.aerodesk.airline.entity.*;
import com.aerodesk.airline.entity.enums.*;
import com.aerodesk.airline.repository.*;
import com.aerodesk.airline.dto.manager.AircraftRequest;
import com.aerodesk.airline.service.ManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.annotation.PostConstruct;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder {

    private final UserRepository userRepository;
    private final PassengerRepository passengerRepository;
    private final EmployeeRepository employeeRepository;
    private final AirportManagerRepository airportManagerRepository;
    private final AdminRepository adminRepository;
    private final AirportRepository airportRepository;
    private final AircraftRepository aircraftRepository;
    private final FlightRepository flightRepository;
    private final ManagerService managerService;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seed() {
        String encodedPassword = passwordEncoder.encode("Test@1234");

        if (userRepository.count() == 0) {
            Passenger p = new Passenger();
            p.setName("Test Passenger");
            p.setEmail("test@passenger.com");
            p.setPassword(encodedPassword);
            p.setRole(Role.PASSENGER);
            p.setPhone("1234567890");
            p.setDateOfBirth(LocalDate.of(1998, 4, 16));
            p.setGender("MALE");
            p.setNationality("Indian");
            p.setPassportNumber("N1234567");
            passengerRepository.save(p);

            Employee e = new Employee();
            e.setName("Test Employee");
            e.setEmail("emp001");
            e.setPassword(encodedPassword);
            e.setRole(Role.EMPLOYEE);
            e.setEmployeeId("emp001");
            employeeRepository.save(e);

            AirportManager m = new AirportManager();
            m.setName("Test Manager");
            m.setEmail("mgr001");
            m.setPassword(encodedPassword);
            m.setRole(Role.AIRPORT_MANAGER);
            m.setAirportCode("DEL");
            airportManagerRepository.save(m);

            Admin a = new Admin();
            a.setName("Test Admin");
            a.setEmail("admin001");
            a.setPassword(encodedPassword);
            a.setRole(Role.ADMIN);
            a.setAdminId("admin001");
            adminRepository.save(a);
        }

        Map<String, String> airportCities = Map.of(
                "DEL", "Delhi",
                "BOM", "Mumbai",
                "BLR", "Bengaluru",
                "MAA", "Chennai",
                "CCU", "Kolkata",
                "LKO", "Lucknow",
                "GAU", "Guwahati",
                "HYD", "Hyderabad",
                "PNQ", "Pune",
                "AMD", "Ahmedabad"
        );

        List<Airport> airports = new ArrayList<>();
        for (Map.Entry<String, String> entry : airportCities.entrySet()) {
            Airport airport = airportRepository.findByCodeIgnoreCase(entry.getKey()).orElseGet(() -> {
                Airport item = new Airport();
                item.setCode(entry.getKey());
                item.setCity(entry.getValue());
                item.setName(entry.getValue() + " International Airport");
                return airportRepository.save(item);
            });
            airports.add(airport);
        }

        AirportManager manager = airportManagerRepository.findAll().stream().findFirst().orElseThrow();

        List<Aircraft> aircrafts = new ArrayList<>(aircraftRepository.findAll());
        if (aircrafts.isEmpty() || aircrafts.size() < 3) {
            String[] models = {"Air India Boeing 777", "IndiGo Airbus A320", "Vistara Boeing 737"};
            String[] regs = {"VT-AI1", "VT-6E2", "VT-UK3"};
            for (int i = 0; i < 3; i++) {
                try {
                    AircraftRequest req = new AircraftRequest();
                    req.setModel(models[i]);
                    req.setRegistrationNumber(regs[i]);
                    req.setTotalSeats(180);
                    req.setEconomySeats(150);
                    req.setBusinessSeats(20);
                    req.setFirstClassSeats(10);
                    aircrafts.add(managerService.createAircraft(req, manager.getId()));
                } catch (RuntimeException ignored) {
                    aircraftRepository.findByRegistrationNumber(regs[i]).ifPresent(aircrafts::add);
                }
            }
        }

        int existingFlights = (int) flightRepository.count();
        int targetFlights = 100;
        int flightsToCreate = Math.max(0, targetFlights - existingFlights);
        LocalDateTime baseDeparture = LocalDateTime.now().plusDays(1).withHour(6).withMinute(0).withSecond(0).withNano(0);

        for (int i = 0; i < flightsToCreate; i++) {
            Airport origin = airports.get(i % airports.size());
            Airport destination = airports.get((i * 3 + 1) % airports.size());
            if (origin.getId().equals(destination.getId())) {
                destination = airports.get((i * 3 + 2) % airports.size());
            }

            LocalDateTime departure = baseDeparture.plusHours(i * 3L);
            FlightStatus status = switch (i % 6) {
                case 1 -> FlightStatus.BOARDING;
                case 2 -> FlightStatus.DELAYED;
                case 3 -> FlightStatus.DEPARTED;
                case 4 -> FlightStatus.ARRIVED;
                case 5 -> FlightStatus.SCHEDULED;
                default -> FlightStatus.SCHEDULED;
            };

            BigDecimal price = BigDecimal.valueOf(4200 + ((i % 12) * 450L));

            String[] prefixes = {"AI", "6E", "UK"};
            String prefix = prefixes[i % 3];
            String flightNumber = prefix + "-" + (100 + existingFlights + i);
            if (flightRepository.findAll().stream().anyMatch(flight -> flightNumber.equalsIgnoreCase(flight.getFlightNumber()))) {
                continue;
            }

                Flight f = new Flight();
                f.setFlightNumber(flightNumber);
                f.setOriginAirport(origin);
                f.setDestinationAirport(destination);
                f.setDepartureTime(departure);
                f.setArrivalTime(departure.plusHours(2).plusMinutes((i % 3) * 20L));
                f.setStatus(status);
                f.setPrice(price);
                f.setAircraft(aircrafts.get(i % aircrafts.size()));
                flightRepository.save(f);
        }
    }
}
