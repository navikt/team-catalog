package no.nav.data.team.team.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.contact.domain.ContactAddress;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Team implements DomainObject, Membered {

    private UUID id;
    private String name;
    private String description;
    private String slackChannel;
    private String contactPersonIdent;
    @Builder.Default
    private List<ContactAddress> contactAddresses = new ArrayList<>();
    private UUID productAreaId;
    private String teamOwnerIdent;
    private TeamType teamType;
    private LocalDateTime qaTime;
    @Builder.Default
    private List<UUID> clusterIds = new ArrayList<>();
    @Builder.Default
    private List<String> naisTeams = new ArrayList<>();
    @Builder.Default
    private List<TeamMember> members = new ArrayList<>();
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    @Builder.Default
    private List<Location> locations = new ArrayList<>();

    private ChangeStamp changeStamp;
    private boolean updateSent;
    private LocalDateTime lastNudge;

    public Team convert(TeamRequest request){
        name = request.getName();
        description = request.getDescription();
        slackChannel = request.getSlackChannel();
        contactPersonIdent = request.getContactPersonIdent();
        contactAddresses = copyOf(request.getContactAddresses());
        productAreaId = request.productAreaIdAsUUID();
        teamOwnerIdent = request.getTeamOwnerIdent();
        clusterIds = StreamUtils.convert(request.getClusterIds(), UUID::fromString);
        teamType = request.getTeamType();
        qaTime = request.getQaTime();
        naisTeams = copyOf(request.getNaisTeams());
        tags = copyOf(request.getTags());
        locations = copyOf(request.getLocations());
        // If an update does not contain member array don't update
        if (!request.isUpdate() || request.getMembers() != null) {
            members = StreamUtils.convert(request.getMembers(), TeamMember::convert);
        }
        members.sort(Comparator.comparing(TeamMember::getNavIdent));
        updateSent = false;
        return this;
    }

    public TeamResponse convertToResponse(UUID defaultProductAreaId) {
        return TeamResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .slackChannel(slackChannel)
                .contactPersonIdent(contactPersonIdent)
                .contactAddresses(copyOf(contactAddresses))
                .productAreaId(productAreaId)
                .teamOwnerIdent(teamOwnerIdent)
                .isInDefaultProductArea(defaultProductAreaId.equals(productAreaId))
                .clusterIds(copyOf(clusterIds))
                .teamType(teamType)
                .qaTime(qaTime)
                .naisTeams(copyOf(naisTeams))
                .tags(copyOf(tags))
                .locations(copyOf(locations))
                .members(StreamUtils.convert(members, TeamMember::convertToResponse))
                .changeStamp(convertChangeStampResponse())
                .links(Links.getFor(this))
                .build();
    }
}
