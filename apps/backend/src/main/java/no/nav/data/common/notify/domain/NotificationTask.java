package no.nav.data.common.notify.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationTask implements DomainObject {

    private UUID id;
    private ChangeStamp changeStamp;

    private String ident;
    private NotificationTime time;
    private List<NotificationTarget> targets;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationTarget {

        private UUID targetId;
        private String type;
        private UUID prevAuditId;
        private UUID currAuditId;
    }

}
