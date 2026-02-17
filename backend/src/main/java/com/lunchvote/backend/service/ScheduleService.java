package com.lunchvote.backend.service;

import com.lunchvote.backend.model.Schedule;
import com.lunchvote.backend.dto.ScheduleDTO;
import com.lunchvote.backend.model.Restaurant;
import com.lunchvote.backend.repository.ScheduleRepository;
import com.lunchvote.backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final RestaurantRepository restaurantRepository;

    public ScheduleService(ScheduleRepository scheduleRepository, RestaurantRepository restaurantRepository) {
        this.scheduleRepository = scheduleRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional
    public ScheduleDTO createSchedule(Long restaurantId, String dateString) {
        LocalDate date = LocalDate.parse(dateString);

        // Business Rule: One lunch per day. Delete existing if found.
        scheduleRepository.findByLunchDate(date).ifPresent(scheduleRepository::delete);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Schedule schedule = new Schedule();
        schedule.setLunchDate(date);
        schedule.setRestaurant(restaurant);

        Schedule saved = scheduleRepository.save(schedule);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public ScheduleDTO getToday() {
        return scheduleRepository.findByLunchDate(LocalDate.now())
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
        return new ScheduleDTO(
            schedule.getId(),
            schedule.getLunchDate(),
            schedule.getRestaurant().getId(),
            schedule.getRestaurant().getName(),
            schedule.getRestaurant().getAddress()
        );
    }
    
}