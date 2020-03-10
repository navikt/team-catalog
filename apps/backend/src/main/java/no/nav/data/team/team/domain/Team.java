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
    private List<String> naisTeams;
    private List<TeamMember> members;

    public Team convert(TeamRequest request) {
        name = request.getName();
        description = request.getDescription();
        slackChannel = request.getSlackChannel();
        productAreaId = request.getProductAreaId();
        naisTeams = StreamUtils.copyOf(request.getNaisTeams());
        // If an update does not contain member array don't update
        if (!request.isUpdate() || request.getMembers() != null) {
            members = StreamUtils.convert(request.getMembers(), TeamMember::convert);
        }
        return this;
    }

    public TeamResponse convertToResponse() {
        return TeamResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .slackChannel(slackChannel)
                .productAreaId(productAreaId)
                .naisTeams(StreamUtils.copyOf(naisTeams))
                .members(StreamUtils.convert(members, TeamMember::convertToResponse))
                .build();
    }
}
