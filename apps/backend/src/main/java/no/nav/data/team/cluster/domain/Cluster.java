package no.nav.data.team.cluster.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.team.cluster.dto.ClusterRequest;
import no.nav.data.team.cluster.dto.ClusterResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cluster implements DomainObject {

    private UUID id;
    private String name;
    private String description;
    private List<String> tags;

    private ChangeStamp changeStamp;

    public Cluster convert(ClusterRequest request) {
        name = request.getName();
        description = request.getDescription();
        tags = copyOf(request.getTags());
        return this;
    }

    public ClusterResponse convertToResponse() {
        return ClusterResponse.builder()
                .id(id)
                .name(name)
                .description(description)
                .tags(copyOf(tags))
                .changeStamp(convertChangeStampResponse())
                .build();
    }
}
