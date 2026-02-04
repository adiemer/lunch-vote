package com.lunchvote.backend.controller;

import com.lunchvote.backend.model.Vote;
import com.lunchvote.backend.service.VoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/votes") // <-- this is the base path
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

   @PostMapping
public Vote saveVote(@RequestBody Vote vote) {
    // Log the incoming vote immediately
    System.out.println("--- NEW VOTE INCOMING ---");
    System.out.println("User: " + vote.getUsername() + " picked: " + vote.getRestaurant());
    
    return voteService.saveVote(vote);
}

    @GetMapping
    public List<Vote> getAllVotes() {
    List<Vote> votes = voteService.getAllVotes();
    
    // This will only print if 'votes' is NOT empty
    if (votes.isEmpty()) {
        System.out.println("LOG: No votes found in database.");
    } else {
        votes.forEach(v -> System.out.println("USERNAME = " + v.getUsername() + " CHOSE " + v.getRestaurant()));
    }
    
    return votes; // Return the list we already have
}
}
