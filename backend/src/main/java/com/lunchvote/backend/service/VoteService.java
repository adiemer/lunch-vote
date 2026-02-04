package com.lunchvote.backend.service;

import com.lunchvote.backend.model.Vote;
import com.lunchvote.backend.repository.VoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoteService {

    private final VoteRepository voteRepository;

    // Constructor injection (professional standard)
    public VoteService(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    // Save a vote
    public Vote saveVote(Vote vote) { 

        boolean alreadyVoted = voteRepository.existsByUsername(vote.getUsername());

    if (alreadyVoted) {
        // If they exist, we 'Explode' (Throw Error)
        throw new RuntimeException("User " + vote.getUsername() + " has already cast a vote!");
    }
    
    // VALIDATOR: We now reach inside 'vote' to get the names
    if (voteRepository.existsByRestaurantAndUsername(vote.getRestaurant(), vote.getUsername())) {
        throw new IllegalArgumentException("Already voted!");
    }

    return voteRepository.save(vote); 
}

    // Get all votes
    public List<Vote> getAllVotes() {
        return voteRepository.findAll();   // <-- repository call
    }
}
