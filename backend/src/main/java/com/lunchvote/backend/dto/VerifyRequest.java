package com.lunchvote.backend.dto;

import lombok.Data;

@Data
public class VerifyRequest {
    private String phoneNumber;
    private String pin;
}