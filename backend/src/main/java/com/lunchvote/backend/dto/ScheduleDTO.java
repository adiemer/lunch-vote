package com.lunchvote.backend.dto;

import java.time.LocalDate;

public record ScheduleDTO(
    Long id,
    String lunchDate,
    Long restaurantId,
    String restaurantName,
    String restaurantAddress,
    String label
) {}