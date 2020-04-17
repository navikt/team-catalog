package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.common.storage.domain.DomainObject;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team implements DomainObject {

    private UUID id;
    private String name;
    private String description;
    private String slackChannel;
    private String productAreaId;
    private String teamLeader;
    private TeamType teamType;
    private boolean teamLeadQA;
    private List<String> naisTeams;
    private List<TeamMember> members;
    private boolean updateSent;

    public Team convert(TeamRequest request) {
        name = request.getName();
        description = request.getDescription();
        slackChannel = request.getSlackChannel();
        productAreaId = request.getProductAreaId();
        teamLeader = request.getTeamLeader();
        teamType = request.getTeamType();
        teamLeadQA = request.isTeamLeadQA();
        naisTeams = copyOf(request.getNaisTeams());
        // If an update does not contain member array don't update
        if (!request.isUpdate() || request.getMembers() != null) {
            members = StreamUtils.convert(request.getMembers(), TeamMember::convert);
        }
        if (teamLeader != null && StreamUtils.filter(members, member -> member.getNavIdent().equals(teamLeader)).isEmpty()) {
            members.add(TeamMember.builder().role("Teamleder").navIdent(teamLeader).build());
        }
        updateSent = false;
        return this;
    }

    public TeamResponse convertToResponse() {
        return TeamResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .slackChannel(slackChannel)
                .productAreaId(productAreaId)
                .teamLeader(teamLeader)
                .teamType(teamType)
                .teamLeadQA(teamLeadQA)
                .naisTeams(copyOf(naisTeams))
                .members(StreamUtils.convert(members, TeamMember::convertToResponse))
                .build();
    }
}
