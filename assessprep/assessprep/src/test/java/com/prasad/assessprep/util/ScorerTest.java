package com.prasad.assessprep.util;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class ScorerTest {
    @Test
    void normalizeAcceptsOnlyAToD() {
        assertEquals("B", Scorer.normalize(" b "));
        assertNull(Scorer.normalize("E"));
        assertNull(Scorer.normalize(""));
        assertNull(Scorer.normalize(null));
    }

    @Test
    void isCorrectIgnoresCaseAndRejectsNull() {
        assertTrue(Scorer.isCorrect("C", "c"));
        assertFalse(Scorer.isCorrect("A", "C"));
        assertFalse(Scorer.isCorrect(null, "C"));
    }
}
