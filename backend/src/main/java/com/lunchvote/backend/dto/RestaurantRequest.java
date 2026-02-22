package com.lunchvote.backend.dto;


/**
 * Using a Java Record for DTOs is the modern (Java 21) way to 
 * create immutable data carriers with zero boilerplate.
 */

public record RestaurantRequest(
    String name,
    String address,
    String label
) {}