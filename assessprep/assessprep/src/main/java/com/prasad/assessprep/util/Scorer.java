package com.prasad.assessprep.util;

public final class Scorer {
    private Scorer() {}

    /** Returns "A".."D" (upper-case) or null when the input is missing or invalid. */
    public static String normalize(String option) {
        if (option == null) return null;
        String t = option.trim().toUpperCase();
        return t.matches("[A-D]") ? t : null;
    }

    public static boolean isCorrect(String selected, String correct) {
        return selected != null && selected.equalsIgnoreCase(correct);
    }
}
