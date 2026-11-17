package com.prasad.assessprep.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prasad.assessprep.entity.AttemptAnswer;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {

    @Query("select a from AttemptAnswer a join fetch a.question where a.attempt.id = :attemptId order by a.id")
    List<AttemptAnswer> findByAttemptIdWithQuestion(@Param("attemptId") Long attemptId);
}
