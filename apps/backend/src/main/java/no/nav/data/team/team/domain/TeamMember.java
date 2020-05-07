package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamMemberResponse;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    private String navIdent;
    @Singular
    private List<TeamRole> roles;
    private String description;

    public static TeamMember convert(TeamMemberRequest request) {
        return TeamMember.builder()
                .navIdent(request.getNavIdent())
                .roles(request.getRoles())
                .description(request.getDescription())
                .build();
    }

    public TeamMemberResponse convertToResponse() {
        var builder = TeamMemberResponse.builder()
                .navIdent(getNavIdent())
                .roles(getRoles())
                .description(getDescription());
        NomClient.getInstance()
                .getByNavIdent(getNavIdent())
                .ifPresent(resource ->
                        builder.name(resource.getFullName())
                                .email(resource.getEmail())
                                .resourceType(resource.getResourceType())
                                .startDate(resource.getStartDate())
                                .endDate(resource.getEndDate())
                                .stale(resource.isStale())
                );
        return builder.build();
    }
}
