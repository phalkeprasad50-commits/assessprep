package com.prasad.assessprep.util;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Instant;

import org.junit.jupiter.api.Test;

class TimerPolicyTest {
    private final Instant expires = Instant.parse("2026-11-04T10:00:00Z");

    @Test
    void submissionBeforeExpiryIsNotLate() {
        assertFalse(TimerPolicy.isLate(expires, expires.minusSeconds(30)));
    }

    @Test
    void submissionInsideGraceWindowIsNotLate() {
        assertFalse(TimerPolicy.isLate(expires, expires.plusSeconds(TimerPolicy.GRACE_SECONDS)));
    }

    @Test
    void submissionAfterGraceWindowIsLate() {
        assertTrue(TimerPolicy.isLate(expires, expires.plusSeconds(TimerPolicy.GRACE_SECONDS + 1)));
    }
}
