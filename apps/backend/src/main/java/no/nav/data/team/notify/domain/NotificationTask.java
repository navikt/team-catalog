package no.nav.data.team.notify.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.team.notify.domain.Notification.NotificationChannel;
import no.nav.data.team.notify.domain.Notification.NotificationTime;

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
    private NotificationChannel channel;
    private List<AuditTarget> targets;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuditTarget {

        private UUID targetId;
        private String type;
        private UUID prevAuditId;
        private UUID currAuditId;
        private boolean silent;

        @JsonIgnore
        private AuditVersion prevAuditVersion;
        @JsonIgnore
        private AuditVersion currAuditVersion;

        public boolean isCreate() {
            return prevAuditId == null && currAuditId != null;
        }

        public boolean isUpdate() {
            return prevAuditId != null && currAuditId != null;
        }

        public boolean isDelete() {
            return prevAuditId != null && currAuditId == null;
        }

        public boolean isTeam() {
            return type.equals(AuditVersion.TEAM_TYPE);
        }
    }

}
