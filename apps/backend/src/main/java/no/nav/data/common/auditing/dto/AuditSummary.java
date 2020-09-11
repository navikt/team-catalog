package no.nav.data.common.auditing.dto;

import no.nav.data.common.auditing.domain.Action;

import java.time.LocalDateTime;

public interface AuditSummary {

    LocalDateTime getTime();

    Action getAction();

    String getTableName();

    String getTableId();
}
