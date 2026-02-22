package com.lunchvote.backend.repository;

import com.lunchvote.backend.model.Restaurant;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    // You can add custom query methods here later, like:
    // List<Restaurant> findByLabel(String label);

    List<Restaurant> findAllByActiveTrue();
}