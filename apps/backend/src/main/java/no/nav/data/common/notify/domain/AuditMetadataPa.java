package no.nav.data.common.notify.domain;

import no.nav.data.common.auditing.dto.AuditMetadata;

import java.util.UUID;

public interface AuditMetadataPa extends AuditMetadata {

    UUID getProductAreaId();

}
