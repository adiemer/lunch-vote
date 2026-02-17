package com.lunchvote.backend.dto;

public record RestaurantDTO(
    Long id,
    String name,
    String address,
    String label
) {}