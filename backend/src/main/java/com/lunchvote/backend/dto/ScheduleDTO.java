package com.lunchvote.backend.dto;

public record ScheduleDTO(
    Long id,
    String lunchDate,
    Long restaurantId,
    String restaurantName,
    String restaurantAddress,
    String label
) {}