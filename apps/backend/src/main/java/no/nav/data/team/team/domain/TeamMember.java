package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.domain.Member;
import no.nav.data.team.team.dto.TeamMemberRequest;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember implements Member {

    private String navIdent;
    @Singular
    private List<TeamRole> roles;
    private String description;

    private int teamPercent;
    private LocalDate startDate;
    private LocalDate endDate;

    public static TeamMember convert(TeamMemberRequest request) {
        return TeamMember.builder()
                .navIdent(request.getNavIdent())
                .roles(request.getRoles())
                .description(request.getDescription())
                .teamPercent(request.getTeamPercent())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
    }

    public MemberResponse convertToResponse() {
        var builder = MemberResponse.builder()
                .navIdent(getNavIdent())
                .roles(getRoles())
                .description(getDescription())
                .teamPercent(getTeamPercent())
                .startDate(getStartDate())
                .endDate(getEndDate());

        NomClient.getInstance()
                .getByNavIdent(getNavIdent())
                .ifPresentOrElse(resource ->
                                builder.resource(resource.convertToResponse())
                        , () -> builder.resource(ResourceResponse.builder().navIdent(getNavIdent()).stale(true).build()));
        return builder.build();
    }
}
