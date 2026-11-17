# AssessPrep: Timed Mock Coding-Assessment Platform

A Spring Boot REST backend that simulates an online assessment. Users log in, start a timed test of
randomly chosen questions, submit answers and get an auto-scored result with a per-topic breakdown.

**The timer lives on the server.** `expires_at` is stored when the test starts, and a submission
that arrives after expiry plus a 5-second grace window is marked `TIMED_OUT`, so refreshing or
tampering with the browser does not help.

## Tech
Java 17, Spring Boot 3, Spring Security (JWT, BCrypt), Spring Data JPA/Hibernate, PostgreSQL, Flyway, JUnit 5.

## Run
```bash
docker compose up -d          # PostgreSQL on :5432 (or use your own and set DB_URL / DB_USER / DB_PASSWORD)
mvn spring-boot:run
mvn test
```

## API
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | no | Create account, returns JWT |
| POST | /api/auth/login | no | Login, returns JWT |
| POST | /api/tests/start | yes | Start a timed test (`topic`, `count`, `durationMinutes` all optional) |
| POST | /api/tests/{id}/submit | yes | Submit answers, returns the scored result |
| GET | /api/tests/{id}/result | yes | Result with correct answers and explanations (after submit or expiry) |
| GET | /api/tests/history | yes | All your attempts |

```bash
curl -X POST localhost:8080/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Prasad","email":"p@example.com","password":"password123"}'

curl -X POST localhost:8080/api/tests/start -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" -d '{"topic":"JAVA","count":5,"durationMinutes":10}'

curl -X POST localhost:8080/api/tests/1/submit -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":3,"selected":"D"},{"questionId":5,"selected":"C"}]}'
```

## Design notes
- Questions are fixed per attempt in `attempt_answers`, so the question set cannot change mid-test.
- The correct answer is never sent when a test starts; it is revealed only after submit or expiry.
- Multi-row writes (attempt plus its answer rows) run in one `@Transactional` method.
- Topics: JAVA, SQL, DSA, DBMS. Add more questions with a new Flyway migration (V3__...).

## Possible next steps
Refresh tokens, an admin API for questions, a leaderboard, an Angular front end.
