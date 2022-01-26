package no.nav.data.team.cluster.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.cluster.dto.ClusterRequest;
import no.nav.data.team.cluster.dto.ClusterResponse;
import no.nav.data.team.shared.domain.HistorizedDomainObject;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.team.domain.DomainObjectStatus;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cluster implements DomainObject, Membered, HistorizedDomainObject {

    private UUID id;
    private String name;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private UUID productAreaId;
    private List<ClusterMember> members;

    private DomainObjectStatus status;

    private LocalDateTime lastNudge;
    private ChangeStamp changeStamp;
    private boolean updateSent;

    public List<ClusterMember> getMembers() {
        return members == null ? List.of() : members;
    }

    public Cluster convert(ClusterRequest request) {
        name = request.getName();
        description = request.getDescription();
        slackChannel = request.getSlackChannel();
        tags = copyOf(request.getTags());
        // If an update does not contain member array don't update
        if (!request.isUpdate() || request.getMembers() != null) {
            members = StreamUtils.convert(request.getMembers(), ClusterMember::convert);
        }
        members.sort(Comparator.comparing(ClusterMember::getNavIdent));
        status = request.getStatus();
        productAreaId = request.productAreaIdAsUUID();
        updateSent = false;
        return this;
    }

    public ClusterResponse convertToResponse() {
        return ClusterResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .slackChannel(slackChannel)
                .tags(copyOf(tags))
                .productAreaId(productAreaId)
                .members(StreamUtils.convert(members, ClusterMember::convertToResponse))
                .status(status)
                .changeStamp(convertChangeStampResponse())
                .links(Links.getFor(this))
                .build();
    }
}
