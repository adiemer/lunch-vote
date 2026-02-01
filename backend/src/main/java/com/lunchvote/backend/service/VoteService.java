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
    public Vote saveVote(String restaurant, String comment, String username) {
        Vote vote = new Vote(restaurant, comment, username);
        if (voteRepository.existsByRestaurantAndUsername(restaurant, username)) {
            throw new IllegalArgumentException("User has already voted for this restaurant");
        }
        return voteRepository.save(vote);  // <-- THIS is where you inject and call
    }

    // Get all votes
    public List<Vote> getAllVotes() {
        return voteRepository.findAll();   // <-- repository call
    }
}
