package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.po.domain.OwnerRole;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.team.domain.TeamRole;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"navIdent", "description", "roles", "teamPercent", "startDate", "endDate", "resource"})
public class PaOwnerResponse {

    private String navIdent;
    private String description;
    private OwnerRole role;

    private LocalDate startDate;
    private LocalDate endDate;

    private ResourceResponse resource;

}
