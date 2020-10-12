package no.nav.data.team.notify;

import lombok.experimental.UtilityClass;

import java.time.Period;

@UtilityClass
public class NotificationConstants {

    public static final Period NUDGE_TIME_CUTOFF = Period.ofMonths(3);
    public static final String NUDGE_TIME_CUTOFF_DESCRIPTION = "3 måneder";
}
