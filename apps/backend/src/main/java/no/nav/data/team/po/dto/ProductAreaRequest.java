package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.shared.domain.DomainObjectStatus;

import java.util.List;

import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class ProductAreaRequest implements RequestElement {

    public static final String paOwnerGroupError = "paOwnerGroupError";

    private String id;
    private String name;
    private String nomId;
    private AreaType areaType;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private List<PaMemberRequest> members;
    @JsonSetter(nulls = Nulls.SKIP)
    private PaOwnerGroupRequest ownerGroup = new PaOwnerGroupRequest();

    private DomainObjectStatus status;

    private Boolean update;

    @Override
    public void format() {
        setName(trimToNull(name));
        setNomId(trimToNull(nomId));
        setDescription(trimToNull(description));
        setSlackChannel(trimToNull(slackChannel));
        setTags(formatList(tags));
        if (!areaType.equals(AreaType.PRODUCT_AREA)) setOwnerGroup(null);
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
        validator.validateType(Fields.members, members);
        validateProductAreaOwners(validator);
    }

    private void validateProductAreaOwners(Validator<?> validator) {
        if (this.ownerGroup != null) {
            if (this.areaType == AreaType.PRODUCT_AREA) {
                validator.validateType(Fields.ownerGroup, ownerGroup);
            } else {
                validator.addError(Fields.ownerGroup, paOwnerGroupError, "Areas of type " + this.areaType + " cannot contain an owner group");
            }
        }
    }

    public static ProductAreaRequest convertToRequest(ProductArea productArea) {
        return ProductAreaRequest.builder()
                .id(productArea.getId().toString())
                .name(productArea.getName())
                .nomId(productArea.getNomId())
                .areaType(productArea.getAreaType())
                .description(productArea.getDescription())
                .slackChannel(productArea.getSlackChannel())
                .tags(productArea.getTags())
                .members(productArea.getMembers().stream().map(PaMemberRequest::convertToRequest).toList())
                .ownerGroup(
                        new PaOwnerGroupRequest(
                                productArea.getProductAreaOwnerGroup().getOwnerNavId(),
                                productArea.getProductAreaOwnerGroup().getNomOwnerGroupMemberOrganizationNameMap(),
                                productArea.getProductAreaOwnerGroup().getNomOwnerGroupMemberNavIdList(),
                                productArea.getProductAreaOwnerGroup().getOwnerGroupMemberNavIdList())
                )
                .status(productArea.getStatus())
                .update(productArea.isUpdateSent())
                .build();
    }

}
