package com.lunchvote.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lunchvote.backend.model.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    // This allows us to look up what's for lunch on a specific day
    Optional<Schedule> findByLunchDate(LocalDate lunchDate);

    List<Schedule> findAllByOrderByLunchDateDesc();

}
