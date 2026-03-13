package com.lunchvote.backend.dto;

public class LoginRequest {
    private String phoneNumber;

    // Standard getters and setters are REQUIRED for Spring's JSON mapper
    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
