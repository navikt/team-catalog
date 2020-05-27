package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.common.storage.domain.ChangeStamp;
import no.nav.data.team.common.storage.domain.DomainObject;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;

import java.util.Comparator;
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
    private TeamType teamType;
    private boolean teamLeadQA;
    private List<String> naisTeams;
    private List<TeamMember> members;
    private List<String> tags;

    private ChangeStamp changeStamp;
    private boolean updateSent;

    public Team convert(TeamRequest request) {
        name = request.getName();
        description = request.getDescription();
        slackChannel = request.getSlackChannel();
        productAreaId = request.getProductAreaId();
        teamType = request.getTeamType();
        teamLeadQA = request.isTeamLeadQA();
        naisTeams = copyOf(request.getNaisTeams());
        tags = copyOf(request.getTags());
        // If an update does not contain member array don't update
        if (!request.isUpdate() || request.getMembers() != null) {
            members = StreamUtils.convert(request.getMembers(), TeamMember::convert);
        }
        members.sort(Comparator.comparing(TeamMember::getNavIdent));
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
                .teamType(teamType)
                .teamLeadQA(teamLeadQA)
                .naisTeams(copyOf(naisTeams))
                .tags(copyOf(tags))
                .members(StreamUtils.convert(members, TeamMember::convertToResponse))
                .changeStamp(convertChangeStampResponse())
                .build();
    }
}
