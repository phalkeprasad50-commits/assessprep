CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE questions (
    id             BIGSERIAL PRIMARY KEY,
    topic          VARCHAR(30)   NOT NULL,
    difficulty     VARCHAR(10)   NOT NULL,
    question_text  VARCHAR(1000) NOT NULL,
    option_a       VARCHAR(500)  NOT NULL,
    option_b       VARCHAR(500)  NOT NULL,
    option_c       VARCHAR(500)  NOT NULL,
    option_d       VARCHAR(500)  NOT NULL,
    correct_option VARCHAR(1)    NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    explanation    VARCHAR(1000) NOT NULL
);
CREATE INDEX idx_questions_topic ON questions(topic);

CREATE TABLE attempts (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users(id),
    started_at      TIMESTAMPTZ NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    submitted_at    TIMESTAMPTZ,
    total_questions INT         NOT NULL,
    score           INT,
    status          VARCHAR(20) NOT NULL
);
CREATE INDEX idx_attempts_user ON attempts(user_id, started_at DESC);

CREATE TABLE attempt_answers (
    id              BIGSERIAL PRIMARY KEY,
    attempt_id      BIGINT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id     BIGINT NOT NULL REFERENCES questions(id),
    selected_option VARCHAR(1),
    is_correct      BOOLEAN,
    UNIQUE (attempt_id, question_id)
);
