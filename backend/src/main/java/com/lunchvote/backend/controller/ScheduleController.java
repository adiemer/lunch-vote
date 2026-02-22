package com.lunchvote.backend.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lunchvote.backend.dto.ScheduleDTO;
import com.lunchvote.backend.dto.ScheduleRequest;
import com.lunchvote.backend.service.NotificationService;
import com.lunchvote.backend.service.ScheduleService;

import lombok.extern.slf4j.Slf4j;



@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/schedule")
public class ScheduleController {

   //private final ScheduleRepository scheduleRepository;
   private final ScheduleService scheduleService;

    @Autowired
    private NotificationService notificationService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
public ResponseEntity<?> getSchedules(@RequestParam(required = false) String date) {
    if (date != null) {
        // If a date is provided, find that specific lunch
        return scheduleService.getScheduleByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
    // Otherwise, return the full list as before
    return ResponseEntity.ok(scheduleService.getAllSchedules());
}

   @PostMapping("/{restaurantId}")
   public ScheduleDTO scheduleLunch(@PathVariable Long restaurantId, @RequestParam LocalDate date, @RequestParam(required = false) String label) {
        // The Controller just passes the parameters to the Service
    // The Service handles the Restaurant lookup, the Date parsing, and the Save
    return scheduleService.createSchedule(restaurantId, date, label);
}

// GREEN BUTTON: Just saves the choice to the database
@PostMapping("/draft")
public ResponseEntity<ScheduleDTO> saveDraft(@RequestBody ScheduleRequest request) {
    System.out.println("DEBUG: Received label from React: [" + request.label() + "]");

    ScheduleDTO dto = scheduleService.scheduleLunch(request);

     System.out.println("DEBUG: Returning DTO with label: [" + dto.label() + "]");
    return ResponseEntity.ok(scheduleService.scheduleLunch(request));
   
}

// BLUE BUTTON: Saves the choice AND triggers the broadcast
@PostMapping("/confirm")
public ResponseEntity<ScheduleDTO> confirmSchedule(@RequestBody ScheduleRequest request) {
    // request.restaurantId() and request.lunchDate() are now populated from the JSON
    ScheduleDTO dto = scheduleService.scheduleLunch(request);

    try {
        notificationService.sendEmailBroadcast(
            dto.restaurantName(), 
            dto.restaurantAddress(),
            dto.lunchDate(),
            dto.label()
        );
    } catch (Exception e) {
        System.err.println("Email Broadcast Failed: " + e.getMessage());
    }

    return ResponseEntity.ok(dto);
}

@PostMapping
public ResponseEntity<ScheduleDTO> handleSchedule(@RequestBody ScheduleRequest request) {
    // 1. Save and get the fresh data (this ensures the DB swap is done)
    ScheduleDTO dto = scheduleService.scheduleLunch(request);

    // 2. Trigger the notification using the data from the SAVED DTO
    try {
        notificationService.sendEmailBroadcast(
            dto.label(),            // Uses the label we just saved
            dto.restaurantName(), 
            dto.restaurantAddress(),
            dto.lunchDate()
        );
    } catch (Exception e) {
        log.error("Email failed: {}", e.getMessage());
    }

    return ResponseEntity.ok(dto);
}

   @GetMapping("/today")
    public ScheduleDTO getToday() {
        return scheduleService.getToday();
    }
    
}
