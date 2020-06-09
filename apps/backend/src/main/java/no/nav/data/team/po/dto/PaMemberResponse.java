package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.team.domain.TeamRole;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"navIdent", "description", "roles", "resource"})
public class PaMemberResponse {

    private String navIdent;
    private List<TeamRole> roles;
    private String description;
    private ResourceResponse resource;

}
