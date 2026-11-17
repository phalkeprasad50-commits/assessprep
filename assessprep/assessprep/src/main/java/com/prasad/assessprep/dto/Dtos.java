package com.prasad.assessprep.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class Dtos {
    private Dtos() {}

    // ---- auth ----
    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(String token, String name, String email) {}

    // ---- test ----
    public record StartTestRequest(
            String topic,
            @Min(1) @Max(30) Integer count,
            @Min(1) @Max(180) Integer durationMinutes) {}

    public record QuestionView(Long id, String topic, String difficulty, String text, Map<String, String> options) {}

    public record StartTestResponse(Long attemptId, Instant expiresAt, long durationSeconds, List<QuestionView> questions) {}

    public record AnswerItem(@NotNull Long questionId, String selected) {}

    public record SubmitRequest(@NotNull List<AnswerItem> answers) {}

    public record TopicScore(String topic, int correct, int total) {}

    public record ReviewItem(Long questionId, String text, String selected, String correctOption,
                             boolean correct, String explanation) {}

    public record ResultResponse(Long attemptId, String status, int score, int total, double percentage,
                                 List<TopicScore> topicBreakdown, List<ReviewItem> review) {}

    public record HistoryItem(Long attemptId, String status, Integer score, int total, Instant startedAt) {}
}
