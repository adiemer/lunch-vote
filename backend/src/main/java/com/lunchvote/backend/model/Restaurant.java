package com.lunchvote.backend.model; // or .model, depending on your folder name

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurants")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String label;
}