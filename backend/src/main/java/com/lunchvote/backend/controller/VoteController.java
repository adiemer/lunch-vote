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
        return voteService.saveVote(vote.getRestaurant(), vote.getComment(), vote.getUsername());
    }

    @GetMapping
    public List<Vote> getAllVotes() {
        List<Vote> votes = voteService.getAllVotes();
        votes.forEach(v -> System.out.println("USERNAME = " + v.getUsername()));
        return voteService.getAllVotes();
    }
}
