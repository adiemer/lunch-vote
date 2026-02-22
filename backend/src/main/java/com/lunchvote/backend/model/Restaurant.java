package com.lunchvote.backend.model; // or .model, depending on your folder name

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurants")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Restaurant {

    @Builder.Default
    private boolean active = true;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "restaurant_address",nullable = true)
    private String address;

    @Column(nullable = true)
    private String label;
}