package no.nav.data.team.notify;

import lombok.experimental.UtilityClass;

import java.time.Duration;

@UtilityClass
public class NotificationConstants {

    public static final Duration NUDGE_TIME_CUTOFF = Duration.ofDays(3 * 4 * 7L);
    public static final String NUDGE_TIME_CUTOFF_DESCRIPTION = "3 måneder";
}
