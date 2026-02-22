package com.lunchvote.backend.dto;

import java.time.LocalDate;

public record ScheduleRequest(
    Long restaurantId,
    LocalDate lunchDate,
    String label
) {}
