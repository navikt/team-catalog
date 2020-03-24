package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamMemberResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    private String navIdent;
    private String name;
    private String role;

    public static TeamMember convert(TeamMemberRequest request) {
        return TeamMember.builder()
                .navIdent(request.getNavIdent())
                .name(request.getName())
                .role(request.getRole())
                .build();
    }

    public TeamMemberResponse convertToResponse() {
        return TeamMemberResponse.builder()
                .navIdent(getNavIdent())
                .name(getName())
                .role(getRole())
                .build();
    }
}
