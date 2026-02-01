package com.lunchvote.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String restaurant;

    private String comment;

    private String username;

    // Required by JPA
    public Vote() {}

    public Vote(String restaurant, String comment, String username) {
        this.restaurant = restaurant;
        this.comment = comment;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public String getRestaurant() {
        return restaurant;
    }

    public String getComment() {
        return comment;
    }

    public String getUsername() {
        return username;
    }
}
