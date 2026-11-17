package com.prasad.assessprep.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prasad.assessprep.entity.Attempt;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    Optional<Attempt> findByIdAndUserEmail(Long id, String email);
    List<Attempt> findByUserEmailOrderByStartedAtDesc(String email);
}
