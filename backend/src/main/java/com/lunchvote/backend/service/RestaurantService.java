package com.lunchvote.backend.service;

import com.lunchvote.backend.dto.RestaurantDTO;
import com.lunchvote.backend.dto.RestaurantRequest;
import com.lunchvote.backend.model.Restaurant;
import com.lunchvote.backend.repository.RestaurantRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    // Dependency Injection: The Service needs the Repository to talk to the DB
    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    /**
     * Logic for creating a new restaurant.
     * Maps Request DTO -> Entity -> Database -> Response DTO
     */
    @Transactional
    public RestaurantDTO createRestaurant(RestaurantRequest request) {
        // 1. Convert DTO to Entity (The "Request" doesn't have an ID)
        Restaurant restaurant = Restaurant.builder()
                .name(request.name())
                .address(request.address())
                .label(request.label())
                .build();

        // 2. Save the Entity to PostgreSQL
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        // 3. Convert the saved Entity back to a DTO (which now has an ID)
        return mapToDTO(savedRestaurant);
    }

    // Helper method: This is our "Mapping" logic to keep code clean (DRY)
    private RestaurantDTO mapToDTO(Restaurant restaurant) {
        return new RestaurantDTO(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getLabel()
        );
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        // Instead of repository.delete(), we just flip the switch
        restaurant.setActive(false);
        restaurantRepository.save(restaurant);
    }

    @Transactional(readOnly = true)
    public List<RestaurantDTO> getAllRestaurants() {
        // Only show active restaurants to the frontend
        return restaurantRepository.findAllByActiveTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

   @Transactional
public RestaurantDTO updateRestaurant(Long id, RestaurantRequest request) {
    Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

    // Records use method-style accessors (no "get" prefix)
    restaurant.setName(request.name());
    restaurant.setAddress(request.address());
    restaurant.setLabel(request.label());
    
    return mapToDTO(restaurantRepository.save(restaurant));
}
}