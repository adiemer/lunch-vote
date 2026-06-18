package com.lunchvote.backend.controller;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lunchvote.backend.dto.LoginRequest;
import com.lunchvote.backend.dto.VerifyRequest;
import com.lunchvote.backend.service.NotificationService;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.frontend.url}")
public class AuthController {

    @Autowired
    private NotificationService notificationService;

    private final Map<String, String> pinStorage = new ConcurrentHashMap<>();

    @Value("${app.frontend.url}")
    String frontendUrl;

    // This grabs the value you just added to application.properties
    @Value("${app.allowed.phone.numbers:}")
    private String allowedPhoneNumbers;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String phone = request.getPhoneNumber().trim();

        // Security Gatekeeper: Check if the phone number is on your allowed list
        if (allowedPhoneNumbers == null || allowedPhoneNumbers.isEmpty() || 
            !Arrays.asList(allowedPhoneNumbers.split(",")).contains(phone)) {
            
            // 403 Forbidden stops them immediately and doesn't trigger Twilio
            return ResponseEntity.status(403).body(Map.of("message", "Access Denied. Unauthorized user."));
        }

        // 1. Generate and send PIN (Only runs if number is allowed!)
        String sentPin = notificationService.sendVerificationPin(phone);
        
        // 2. SAVE IT
        pinStorage.put(phone, sentPin);
        
        // 3. Return JSON
        return ResponseEntity.ok(Map.of("message", "PIN sent to SMS!"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody VerifyRequest request) {
        String phone = request.getPhoneNumber().trim();
        String userPin = request.getPin().trim();

        String savedPin = pinStorage.get(phone);

        if (savedPin != null && savedPin.equals(userPin)) {
            pinStorage.remove(phone);
            return ResponseEntity.ok(Map.of("message", "Success", "status", "LOGGED_IN"));
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid PIN"));
        }
    }
}
