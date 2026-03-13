package com.lunchvote.backend.controller;

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
// ADD THIS LINE:
@CrossOrigin(origins = "${app.frontend.url}")
public class AuthController {

    @Autowired
    private NotificationService notificationService;

    private final Map<String, String> pinStorage = new ConcurrentHashMap<>();

    @Value("${app.frontend.url}")
     String frontendUrl;

@PostMapping("/login")
public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
    // 1. Generate and send PIN
    String sentPin = notificationService.sendVerificationPin(request.getPhoneNumber());
    
    // 2. ACTUALLY SAVE IT: This uses the 'sentPin' variable and clears the warning
    pinStorage.put(request.getPhoneNumber(), sentPin);
    
    // 3. Return a JSON object (Frontend likes this better than a raw String)
    return ResponseEntity.ok(Map.of("message", "PIN sent to WhatsApp!"));
}

@PostMapping("/verify")
public ResponseEntity<?> verify(@RequestBody VerifyRequest request) {
    // Trim input to avoid invisible space errors
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
