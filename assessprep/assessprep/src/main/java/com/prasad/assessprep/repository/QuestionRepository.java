package com.prasad.assessprep.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prasad.assessprep.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query(value = "SELECT * FROM questions ORDER BY random() LIMIT :n", nativeQuery = true)
    List<Question> findRandom(@Param("n") int n);

    @Query(value = "SELECT * FROM questions WHERE topic = :topic ORDER BY random() LIMIT :n", nativeQuery = true)
    List<Question> findRandomByTopic(@Param("topic") String topic, @Param("n") int n);
}
