package com.prasad.assessprep.util;

import java.time.Instant;

/** The server, not the client, decides whether a submission arrived in time. */
public final class TimerPolicy {
    public static final long GRACE_SECONDS = 5;

    private TimerPolicy() {}

    public static boolean isLate(Instant expiresAt, Instant now) {
        return now.isAfter(expiresAt.plusSeconds(GRACE_SECONDS));
    }
}
