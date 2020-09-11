package no.nav.data.common.notify.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notification implements DomainObject {

    private UUID id;
    private String ident;
    private String target;
    private NotificationType type;
    private NotificationTime time;

    private String lastAuditNotified;
    private ChangeStamp changeStamp;

    public Notification(NotificationDto dto) {
        ident = dto.getIdent();
        target = dto.getTarget();
        type = dto.getType();
        time = dto.getTime();
    }

    public enum NotificationType {
        PA, PA_MEMBERS,
        TEAM, TEAM_MEMBERS,
        ALL_EVENTS
    }

    public enum NotificationTime {
        ALL, DAILY, WEEKLY, MONTHLY
    }

    public NotificationDto convertToDto() {
        return NotificationDto.builder()
                .id(id)
                .ident(ident)
                .target(target)
                .type(type)
                .time(time)
                .build();
    }
}
