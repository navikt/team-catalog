package no.nav.data.team.notify.domain;

import no.nav.data.common.auditing.dto.AuditMetadata;

import java.util.UUID;

public interface TeamAuditMetadata extends AuditMetadata {

    UUID getProductAreaId();

}
