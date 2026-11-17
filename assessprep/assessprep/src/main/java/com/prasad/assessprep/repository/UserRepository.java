package com.prasad.assessprep.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prasad.assessprep.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
