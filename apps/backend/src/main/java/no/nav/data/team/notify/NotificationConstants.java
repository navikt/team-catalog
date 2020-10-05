package no.nav.data.team.notify;

import lombok.experimental.UtilityClass;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

@UtilityClass
public class NotificationConstants {

    public static final Duration NUDGE_TIME_CUTOFF = Duration.of(3, ChronoUnit.MONTHS);
}
