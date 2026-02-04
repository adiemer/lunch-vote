package com.lunchvote.backend.repository;

import com.lunchvote.backend.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUsername(String username);
    boolean existsByRestaurantAndUsername(String restaurant, String username);
    // For now, nothing extra is needed
    // Spring Data JPA provides: save(), findAll(), findById(), deleteById(), etc.
}
