package no.nav.data.common.notify.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notification implements DomainObject {

    private UUID id;
    private String ident;
    private UUID target;
    private NotificationType type;
    private NotificationTime time;
    private List<NotificationChannel> channels;

    private ChangeStamp changeStamp;

    @JsonIgnore
    private List<UUID> dependentTargets;

    public Notification(NotificationDto dto) {
        id = dto.getId();
        ident = dto.getIdent();
        target = dto.getTarget();
        type = dto.getType();
        time = dto.getTime();
        channels = dto.getChannels();
    }

    public enum NotificationChannel {
        EMAIL, SLACK
    }

    public enum NotificationType {
        TEAM,
        PA,
        ALL_EVENTS;

        public static NotificationType min(NotificationType a, NotificationType b) {
            if (a == null) {
                return b;
            } else if (b == null) {
                return a;
            } else {
                if (a.compareTo(b) > 0) {
                    return b;
                }
                return a;
            }
        }
    }

    public enum NotificationTime {
        ALL, DAILY, WEEKLY, MONTHLY
    }

    public List<NotificationChannel> getChannels() {
        return channels == null ? List.of(NotificationChannel.EMAIL) : channels;
    }

    public NotificationDto convertToDto() {
        return NotificationDto.builder()
                .id(id)
                .ident(ident)
                .target(target)
                .type(type)
                .time(time)
                .channels(getChannels())
                .build();
    }

    public boolean isDependentOn(UUID id) {
        return dependentTargets != null && dependentTargets.contains(id);
    }
}
