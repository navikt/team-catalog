package no.nav.data.team.notify.domain;

import no.nav.data.team.notify.domain.Notification.NotificationType;
import org.junit.jupiter.api.Test;

import static no.nav.data.team.notify.domain.Notification.NotificationType.ALL_EVENTS;
import static no.nav.data.team.notify.domain.Notification.NotificationType.PA;
import static no.nav.data.team.notify.domain.Notification.NotificationType.TEAM;
import static org.assertj.core.api.Assertions.assertThat;

class NotificationTypeTest {

    @Test
    void getMinType() {
        assertThat(NotificationType.min(null, PA)).isEqualTo(PA);
        assertThat(NotificationType.min(TEAM, PA)).isEqualTo(TEAM);
        assertThat(NotificationType.min(ALL_EVENTS, PA)).isEqualTo(PA);
    }
}