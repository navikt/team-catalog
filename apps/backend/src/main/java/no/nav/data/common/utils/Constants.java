package no.nav.data.common.utils;

import java.time.Duration;

public final class Constants {

    private Constants() {
        throw new IllegalStateException("Utility class");
    }

    /* Header names */
    // unique id set by caller
    public static final String HEADER_CALL_ID = "Nav-Call-Id";
    // unique id set by this application
    public static final String HEADER_CORRELATION_ID = "X-Correlation-ID";
    // application id set by caller
    public static final String HEADER_CONSUMER_ID = "Nav-Consumer-Id";

    public static final String APP_ID = "team-catalog";
    public static final Duration SESSION_LENGTH = Duration.ofDays(14);

}
