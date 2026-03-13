package com.lunchvote.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lunchvote.backend.dto.ScheduleDTO;
import com.lunchvote.backend.dto.ScheduleRequest;
import com.lunchvote.backend.model.Restaurant;
import com.lunchvote.backend.model.Schedule;
import com.lunchvote.backend.repository.RestaurantRepository;
import com.lunchvote.backend.repository.ScheduleRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationService notificationService;

   

    public ScheduleService(ScheduleRepository scheduleRepository, RestaurantRepository restaurantRepository, NotificationService notificationService) {
        this.scheduleRepository = scheduleRepository;
        this.restaurantRepository = restaurantRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
public Optional<ScheduleDTO> getScheduleByDate(String dateString) {
    LocalDate date = LocalDate.parse(dateString);
    return scheduleRepository.findByLunchDate(date)
            .filter(schedule -> schedule.getRestaurant().isActive())
            .map(this::mapToDTO);
}

    @Transactional
    public ScheduleDTO createSchedule(Long restaurantId, LocalDate date, String label) {
        

        // 1. Find AND Flush the delete
        scheduleRepository.findByLunchDate(date).ifPresent(s -> {
            scheduleRepository.delete(s);
            // This is the magic line. It forces the DB to delete the record NOW 
            // instead of waiting until the end of the method.
            scheduleRepository.flush(); 
        });

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Schedule schedule = new Schedule();
        schedule.setLunchDate(date);
        schedule.setRestaurant(restaurant);
        schedule.setLabel(label);

        Schedule saved = scheduleRepository.save(schedule);
        
        // 2. Return the DTO immediately
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
public ScheduleDTO getToday() {
    return scheduleRepository.findByLunchDate(LocalDate.now())
            .filter(schedule -> schedule.getRestaurant().isActive()) // THE FIX: Filter out inactive
            .map(this::mapToDTO)
            .orElseThrow(() -> new RuntimeException("No lunch scheduled for today!"));
}

    @Transactional(readOnly = true)
    public List<ScheduleDTO> getAllSchedules() {
        return scheduleRepository.findAllByOrderByLunchDateDesc() // Gets Entities from DB
                .stream()                                         // Starts the "Conveyor Belt"
                .map(this::mapToDTO)                              // Converts each Entity to a DTO
                .collect(Collectors.toList());                    // Puts them back into a List
}

    // Helper to transform Entity -> DTO
    private ScheduleDTO mapToDTO(Schedule schedule) {

        String displayLabel = (schedule.getLabel() != null) 
        ? schedule.getLabel() 
        : schedule.getRestaurant().getLabel();

        return new ScheduleDTO(
            schedule.getId(),
            schedule.getLunchDate().toString(),
            schedule.getRestaurant().getId(),
            schedule.getRestaurant().getName(),
            schedule.getRestaurant().getAddress(),
            displayLabel
        );
    }

   @Transactional
    public ScheduleDTO scheduleLunch(ScheduleRequest request) {
        // 1. Delete existing for that date to prevent the "First one sticks" bug
        scheduleRepository.findByLunchDate(request.lunchDate()).ifPresent(existing -> {
            scheduleRepository.delete(existing);
            scheduleRepository.flush(); // Force delete NOW
        });

        Restaurant restaurant = restaurantRepository.findById(request.restaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // 2. Create the new schedule with the LABEL
        Schedule schedule = new Schedule();
        schedule.setRestaurant(restaurant);
        schedule.setLunchDate(request.lunchDate());
        
        // Set the label from the request!
        schedule.setLabel(request.label()); 

        Schedule saved = scheduleRepository.save(schedule);
        return mapToDTO(saved);
    }

    // Inside ScheduleService.java
@Transactional
public void confirmAndNotify(ScheduleRequest request) {
    var rest = restaurantRepository.findById(request.restaurantId())
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));

    // FALLBACK LOGIC:
    // 1. Check if a dynamic label was typed (from the Record)
    // 2. If not, take the label from the Database (from the Entity)
    // 3. If both are empty, default to an empty string
    String finalLabel = "";

    if (request.label() != null && !request.label().isBlank()) {
        finalLabel = request.label();
        rest.setLabel(finalLabel);
        restaurantRepository.save(rest);
        
    } else if (rest.getLabel() != null && !rest.getLabel().isBlank()) {
        finalLabel = rest.getLabel();
    }

    String finalSaveLabel = finalLabel;

    scheduleRepository.findByLunchDate(request.lunchDate()).ifPresent(s -> {
        s.setLabel(finalSaveLabel); // No more error!
        scheduleRepository.save(s);
    });

    

    // Call the broadcaster with the correct order
    notificationService.sendEmailBroadcast(
        rest.getName(),
        rest.getAddress(),
        request.lunchDate().toString(),
        finalSaveLabel
    );
}
}