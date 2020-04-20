package no.nav.data.team.common.rest;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.common.auditing.domain.Auditable.Fields;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({Fields.lastModifiedBy, Fields.lastModifiedDate})
public class ChangeStampResponse {

    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;
}
