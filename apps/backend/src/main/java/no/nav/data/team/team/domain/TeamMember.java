package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.NomClient;
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
        return TeamMemberResponse.builder()
                .navIdent(getNavIdent())
                .name(NomClient.getInstance().getNameForIdent(getNavIdent()))
                .role(getRole())
                .build();
    }
}
