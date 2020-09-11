package no.nav.data.common.auditing.dto;

import no.nav.data.common.auditing.domain.Action;

import java.time.LocalDateTime;
import java.util.UUID;

public interface AuditMetadata {

    String getId();

    default UUID auditId() {
        return UUID.fromString(getId());
    }

    LocalDateTime getTime();

    Action getAction();

    String getTableName();

    String getTableId();
}
