package com.lunchvote.backend.controller;

import com.lunchvote.backend.dto.RestaurantDTO;
import com.lunchvote.backend.dto.RestaurantRequest;
import com.lunchvote.backend.service.RestaurantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/restaurants")
public class RestaurantController {

   private final RestaurantService restaurantService;

    // The Constructor-based injection you're using is best practice!
    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    // This replaces your saveVote method
    @PostMapping
    public RestaurantDTO addRestaurant(@RequestBody RestaurantRequest request) {
        return restaurantService.createRestaurant(request);
    }

    // This replaces your getAllVotes method
    @GetMapping
    public List<RestaurantDTO> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }
}

