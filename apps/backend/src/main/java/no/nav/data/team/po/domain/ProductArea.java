package no.nav.data.team.po.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.shared.dto.Links;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductArea implements DomainObject, Membered {

    private UUID id;
    private String name;
    private AreaType areaType;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private List<PaMember> members;
    private List<Location> locations;

    private ChangeStamp changeStamp;
    private boolean updateSent;
    private LocalDateTime lastNudge;

    public List<PaMember> getMembers() {
        return members == null ? List.of() : members;
    }

    public ProductArea convert(ProductAreaRequest request) {
        name = request.getName();
        areaType = request.getAreaType();
        description = request.getDescription();
        slackChannel = request.getSlackChannel();
        tags = copyOf(request.getTags());
        locations = copyOf(request.getLocations());
        // If an update does not contain member array don't update
        if (!request.isUpdate() || request.getMembers() != null) {
            members = StreamUtils.convert(request.getMembers(), PaMember::convert);
        }
        members.sort(Comparator.comparing(PaMember::getNavIdent));
        updateSent = false;
        return this;
    }

    public ProductAreaResponse convertToResponse() {
        return ProductAreaResponse.builder()
                .id(id)
                .name(name)
                .areaType(areaType)
                .description(description)
                .slackChannel(slackChannel)
                .tags(copyOf(tags))
                .members(StreamUtils.convert(members, PaMember::convertToResponse))
                .locations(copyOf(locations))
                .changeStamp(convertChangeStampResponse())
                .links(Links.getFor(this))
                .build();
    }
}
