package no.nav.data.team.po.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.shared.domain.HistorizedDomainObject;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.shared.domain.DomainObjectStatus;

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
public class ProductArea implements DomainObject, Membered, HistorizedDomainObject {

    private UUID id;
    private String name;
    private String avdelingNomId;
    private String nomId;
    private AreaType areaType;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private List<PaMember> members;
    private List<String> ownerGroupNavidentList;

    private DomainObjectStatus status;

    private ChangeStamp changeStamp;
    private LocalDateTime lastNudge;

    public List<PaMember> getMembers() {
        return members == null ? List.of() : members;
    }

    public ProductArea setFieldsFromRequest(ProductAreaRequest request, String avdelingNomId, List<PaMember> members) {
        name = request.getName();
        areaType = request.getAreaType();
        if (request.getAreaType().equals(AreaType.PRODUCT_AREA)) {
            this.avdelingNomId = avdelingNomId;
            this.ownerGroupNavidentList = request.getOwnerGroupNavidentList();
        }
        nomId = request.getNomId();
        description = request.getDescription();
        slackChannel = request.getSlackChannel();
        tags = copyOf(request.getTags());
        this.setMembers(members);
        this.members.sort(Comparator.comparing(PaMember::getNavIdent));
        status = request.getStatus();

        return this;
    }

    public ProductAreaResponse convertToResponse(String defaultProductAreaId) {
        return ProductAreaResponse.builder()
                .id(id)
                .name(name)
                .avdelingNomId(avdelingNomId)
                .nomId(nomId)
                .areaType(areaType)
                .description(description)
                .slackChannel(slackChannel)
                .tags(copyOf(tags))
                .members(StreamUtils.convert(members, PaMember::convertToResponse))
                .ownerGroupNavidentList(this.getOwnerGroupNavidentList())
                .changeStamp(convertChangeStampResponse())
                .links(Links.getFor(this))
                .status(status)
                .isDefaultArea(this.id.toString().equals(defaultProductAreaId))
                .build();
    }
}
