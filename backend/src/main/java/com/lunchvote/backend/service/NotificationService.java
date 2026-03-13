package com.lunchvote.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@Slf4j
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    // Twilio Values
    @Value("${twilio.sid}")
    private String twilioSid;

    @Value("${twilio.token}")
    private String twilioToken;

    @Value("${twilio.from}")
    private String fromNumber;

    @Value("${my.personal.phone}") // Matches my.personal.phone in properties
    private String myPhone;

    // Email Values
    @Value("${notification.group-list}")
    private String groupListRaw;

    @PostConstruct
    public void init() {
        if (twilioSid == null || twilioSid.equals("AC_placeholder")) {
        System.err.println("❌ ERROR: Twilio SID is NOT loading! Check your environment variables.");
    } else {
        System.out.println("✅ Twilio initialized with SID: " + twilioSid);
        Twilio.init(twilioSid, twilioToken);
        log.info("Twilio initialized for WhatsApp notifications.");
        log.info("Twilio SID: " + twilioSid);
    }
    }

    // --- WHATSAPP / PIN LOGIC ---
    public String sendVerificationPin(String toPhone) {
        String pin = String.format("%06d", new Random().nextInt(1000000));
        
        Message.creator(
            new PhoneNumber("whatsapp:" + toPhone),
            new PhoneNumber("whatsapp:" + fromNumber),
            "Your Lunch Dash login PIN is: " + pin
        ).create();

        log.info("Sent PIN to WhatsApp: {}", toPhone);
        return pin; 
    }

    // --- EMAIL BROADCAST LOGIC ---
    public void sendEmailBroadcast(String restaurant, String address, String rawDate, String label) {
        if (groupListRaw == null || groupListRaw.isEmpty()) {
            log.error("GROUP_EMAILS environment variable is not set!");
            return;
        }

        String[] recipients = groupListRaw.split(",");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipients);
        message.setSubject("🍴 Lunch Dash: " + restaurant);

        StringBuilder body = new StringBuilder();
        body.append("Lunch Pick: ").append(restaurant).append("\n")
            .append("When: ").append(rawDate).append("\n")
            .append("Notes: ").append((label != null) ? label : "").append("\n");

        if (address != null && !address.trim().isEmpty()) {
            body.append("Location: ").append(address).append("\n");
            String mapUrl = "https://www.google.com/maps/search/?api=1&query=" + address.replace(" ", "+");
            body.append("\n📍 Directions: ").append(mapUrl);
        }

        message.setText(body.toString());

        try {
            mailSender.send(message);
            log.info("Broadcast sent for {}", restaurant);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
        }
    }
}