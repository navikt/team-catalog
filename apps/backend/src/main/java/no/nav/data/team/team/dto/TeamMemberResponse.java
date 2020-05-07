package no.nav.data.team.team.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.annotations.ApiParam;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.team.domain.TeamRole;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"navIdent", "name", "email", "resourceType", "startDate", "endDate", "description", "roles", "stale"})
public class TeamMemberResponse {

    private String navIdent;
    private String name;
    private String email;
    private ResourceType resourceType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private List<TeamRole> roles;
    @ApiParam(value = "If true, the resource behind this member is no longer to be found in NOM")
    private boolean stale;

}
