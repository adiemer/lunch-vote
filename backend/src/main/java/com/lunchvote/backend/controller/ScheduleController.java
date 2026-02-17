package com.lunchvote.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lunchvote.backend.dto.ScheduleDTO;
import com.lunchvote.backend.model.Restaurant;
import com.lunchvote.backend.model.Schedule;
import com.lunchvote.backend.repository.RestaurantRepository;
import com.lunchvote.backend.repository.ScheduleRepository;
import com.lunchvote.backend.service.ScheduleService;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/schedule")
public class ScheduleController {

   //private final ScheduleRepository scheduleRepository;
   private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public List<ScheduleDTO> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @PostMapping("/{restaurantId}")
   public ScheduleDTO scheduleLunch(@PathVariable Long restaurantId, @RequestParam String date) {
    // The Service handles the Restaurant lookup, the Date parsing, and the Save
    return scheduleService.createSchedule(restaurantId, date);
}

   @GetMapping("/today")
    public ScheduleDTO getToday() {
        return scheduleService.getToday();
    }
    
}
