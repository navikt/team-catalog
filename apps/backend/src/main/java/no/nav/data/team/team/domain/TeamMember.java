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

    private String nomId;
    private String azureId;
    private String name;
    private String role;

    public static TeamMember convert(TeamMemberRequest request) {
        return TeamMember.builder()
                .nomId(request.getNomId())
                .azureId(request.getAzureId())
                .name(request.getName())
                .role(request.getRole())
                .build();
    }

    public TeamMemberResponse convertToResponse() {
        return TeamMemberResponse.builder()
                .nomId(getNomId())
                .azureId(getAzureId())
                .name(getName())
                .role(getRole())
                .build();
    }
}
