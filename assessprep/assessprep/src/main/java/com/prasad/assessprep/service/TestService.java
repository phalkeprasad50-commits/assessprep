package com.prasad.assessprep.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prasad.assessprep.dto.Dtos.*;
import com.prasad.assessprep.entity.Attempt;
import com.prasad.assessprep.entity.AttemptAnswer;
import com.prasad.assessprep.entity.AttemptStatus;
import com.prasad.assessprep.entity.Question;
import com.prasad.assessprep.entity.User;
import com.prasad.assessprep.exception.ApiException;
import com.prasad.assessprep.repository.AttemptAnswerRepository;
import com.prasad.assessprep.repository.AttemptRepository;
import com.prasad.assessprep.repository.QuestionRepository;
import com.prasad.assessprep.repository.UserRepository;
import com.prasad.assessprep.util.Scorer;
import com.prasad.assessprep.util.TimerPolicy;

@Service
public class TestService {
    private static final int DEFAULT_COUNT = 10;
    private static final int DEFAULT_MINUTES = 15;

    private final UserRepository users;
    private final QuestionRepository questions;
    private final AttemptRepository attempts;
    private final AttemptAnswerRepository answers;

    public TestService(UserRepository users, QuestionRepository questions,
                       AttemptRepository attempts, AttemptAnswerRepository answers) {
        this.users = users;
        this.questions = questions;
        this.attempts = attempts;
        this.answers = answers;
    }

    /** Picks random questions, fixes them to the attempt and starts the server-side clock. */
    @Transactional
    public StartTestResponse start(String email, StartTestRequest req) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        int count = req.count() == null ? DEFAULT_COUNT : req.count();
        int minutes = req.durationMinutes() == null ? DEFAULT_MINUTES : req.durationMinutes();
        String topic = (req.topic() == null || req.topic().isBlank()) ? null : req.topic().trim().toUpperCase();

        List<Question> picked = (topic == null)
                ? questions.findRandom(count)
                : questions.findRandomByTopic(topic, count);
        if (picked.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No questions available for this topic");
        }

        Instant now = Instant.now();
        Attempt attempt = new Attempt();
        attempt.setUser(user);
        attempt.setStartedAt(now);
        attempt.setExpiresAt(now.plusSeconds(minutes * 60L));
        attempt.setTotalQuestions(picked.size());
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempts.save(attempt);

        List<AttemptAnswer> rows = new ArrayList<>();
        for (Question q : picked) {
            AttemptAnswer row = new AttemptAnswer();
            row.setAttempt(attempt);
            row.setQuestion(q);
            rows.add(row);
        }
        answers.saveAll(rows);

        List<QuestionView> views = picked.stream().map(this::toView).toList();
        return new StartTestResponse(attempt.getId(), attempt.getExpiresAt(), minutes * 60L, views);
    }

    /** Scores the attempt, unless the server clock says the time is up. */
    @Transactional
    public ResultResponse submit(String email, Long attemptId, SubmitRequest req) {
        Attempt attempt = findOwned(email, attemptId);
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ApiException(HttpStatus.CONFLICT, "This attempt is already finished");
        }
        Instant now = Instant.now();
        List<AttemptAnswer> rows = answers.findByAttemptIdWithQuestion(attemptId);

        if (TimerPolicy.isLate(attempt.getExpiresAt(), now)) {
            attempt.setStatus(AttemptStatus.TIMED_OUT);
            attempt.setScore(0);
        } else {
            Map<Long, String> chosen = new HashMap<>();
            for (AnswerItem item : req.answers()) {
                chosen.put(item.questionId(), Scorer.normalize(item.selected()));
            }
            int score = 0;
            for (AttemptAnswer row : rows) {
                String sel = chosen.get(row.getQuestion().getId());
                boolean ok = Scorer.isCorrect(sel, row.getQuestion().getCorrectOption());
                row.setSelectedOption(sel);
                row.setCorrect(ok);
                if (ok) score++;
            }
            attempt.setScore(score);
            attempt.setStatus(AttemptStatus.SUBMITTED);
        }
        attempt.setSubmittedAt(now);
        return buildResult(attempt, rows);
    }

    @Transactional
    public ResultResponse getResult(String email, Long attemptId) {
        Attempt attempt = findOwned(email, attemptId);
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            if (!TimerPolicy.isLate(attempt.getExpiresAt(), Instant.now())) {
                throw new ApiException(HttpStatus.CONFLICT, "Test still in progress. Submit it first");
            }
            attempt.setStatus(AttemptStatus.TIMED_OUT);
            attempt.setScore(0);
            attempt.setSubmittedAt(Instant.now());
        }
        return buildResult(attempt, answers.findByAttemptIdWithQuestion(attemptId));
    }

    @Transactional(readOnly = true)
    public List<HistoryItem> history(String email) {
        return attempts.findByUserEmailOrderByStartedAtDesc(email).stream()
                .map(a -> new HistoryItem(a.getId(), a.getStatus().name(), a.getScore(),
                        a.getTotalQuestions(), a.getStartedAt()))
                .toList();
    }

    // ---------- helpers ----------

    private Attempt findOwned(String email, Long attemptId) {
        return attempts.findByIdAndUserEmail(attemptId, email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Attempt not found"));
    }

    private QuestionView toView(Question q) {
        Map<String, String> options = new LinkedHashMap<>();
        options.put("A", q.getOptionA());
        options.put("B", q.getOptionB());
        options.put("C", q.getOptionC());
        options.put("D", q.getOptionD());
        return new QuestionView(q.getId(), q.getTopic(), q.getDifficulty(), q.getQuestionText(), options);
    }

    private ResultResponse buildResult(Attempt attempt, List<AttemptAnswer> rows) {
        Map<String, int[]> byTopic = new LinkedHashMap<>();
        List<ReviewItem> review = new ArrayList<>();
        for (AttemptAnswer row : rows) {
            Question q = row.getQuestion();
            boolean ok = Boolean.TRUE.equals(row.getCorrect());
            int[] t = byTopic.computeIfAbsent(q.getTopic(), k -> new int[2]);
            t[1]++;
            if (ok) t[0]++;
            review.add(new ReviewItem(q.getId(), q.getQuestionText(), row.getSelectedOption(),
                    q.getCorrectOption(), ok, q.getExplanation()));
        }
        List<TopicScore> breakdown = byTopic.entrySet().stream()
                .map(e -> new TopicScore(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();
        int score = attempt.getScore() == null ? 0 : attempt.getScore();
        int total = attempt.getTotalQuestions();
        double pct = total == 0 ? 0 : Math.round(score * 10000.0 / total) / 100.0;
        return new ResultResponse(attempt.getId(), attempt.getStatus().name(), score, total, pct, breakdown, review);
    }
}
