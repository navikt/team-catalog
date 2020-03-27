package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamMemberResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    private String navIdent;
    private String role;

    public static TeamMember convert(TeamMemberRequest request) {
        return TeamMember.builder()
                .navIdent(request.getNavIdent())
                .role(request.getRole())
                .build();
    }

    public TeamMemberResponse convertToResponse() {
        Resource resource = NomClient.getInstance().getByNavIdent(getNavIdent());
        var builder = TeamMemberResponse.builder()
                .navIdent(getNavIdent())
                .role(getRole());
        if (resource != null) {
            builder.name(resource.getFullName())
                    .email(resource.getEmail())
                    .resourceType(resource.getResourceType());
        }
        return builder.build();
    }
}
