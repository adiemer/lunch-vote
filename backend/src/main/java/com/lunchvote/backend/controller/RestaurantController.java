package com.lunchvote.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lunchvote.backend.dto.RestaurantDTO;
import com.lunchvote.backend.dto.RestaurantRequest;
import com.lunchvote.backend.service.RestaurantService;

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

    @DeleteMapping("/{id}")
public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
    restaurantService.deleteRestaurant(id);
    return ResponseEntity.noContent().build(); // "No Content" is the standard 204 response for successful deletes
}

   @PutMapping("/{id}") // <--- Is the {id} inside the quotes?
public ResponseEntity<RestaurantDTO> updateRestaurant(
    @PathVariable Long id, // <--- Is @PathVariable there?
    @RequestBody RestaurantRequest request
) {
    return ResponseEntity.ok(restaurantService.updateRestaurant(id, request));
}
}