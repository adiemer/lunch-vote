package com.lunchvote.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${notification.group-list}")
    private String groupListRaw;

    public void sendEmailBroadcast(String restaurant, String address, String rawDate, String label) {
        System.out.println("The raw data is: " + rawDate);
    if (groupListRaw == null || groupListRaw.isEmpty()) {
        System.err.println("❌ Error: GROUP_EMAILS environment variable is not set!");
        return;
    }

    String[] recipients = groupListRaw.split(",");
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(recipients);
    message.setSubject("🍴 Lunch Dash: " + restaurant);

    // Build the body dynamically based on whether address exists
    StringBuilder body = new StringBuilder();
    body.append("Lunch Pick: ").append(restaurant).append("\n");
    body.append("When: ").append(rawDate).append("\n");
    //body.append("Notes: ").append(label).append("\n");
    
    if (address != null && !address.trim().isEmpty()) {
        body.append("Location: ").append(address).append("\n");
        
        // Only add the map link if we have an address
        String mapUrl = "https://www.google.com/maps/search/?api=1&query=" + address.replace(" ", "+");
        body.append("\n📍 Directions: ").append(mapUrl);
    } else {
        body.append("\n(No specific address provided)");
    }

    if (label != null && !label.trim().isEmpty()) {
        System.out.println("##### LABEL is: " + label);
        String refLabel = label;
        body.append("\nNotes: ").append(refLabel);
    } else {
        body.append("\n(No additional notes)");
    }

    

    message.setText(body.toString());

    try {
        mailSender.send(message);
        System.out.println("✅ Broadcast sent for " + restaurant);
    } catch (Exception e) {
        System.err.println("❌ Failed to send email: " + e.getMessage());
    }
}
}

