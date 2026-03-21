package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.domain.Role;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StringUtils.formatList;
import static no.nav.data.common.validator.Validator.NAV_IDENT_PATTERN;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor(onConstructor_ = @JsonCreator)
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
    private List<String> ownerGroupNavidentList;

    private DomainObjectStatus status;

    private Boolean update;

    @Override
    public void format() {
        setName(trimToNull(name));
        setNomId(trimToNull(nomId));
        setDescription(trimToNull(description));
        setSlackChannel(trimToNull(slackChannel));
        setTags(formatList(tags));
        if (!areaType.equals(AreaType.PRODUCT_AREA)) setOwnerGroupNavidentList(null);
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
        if (this.ownerGroupNavidentList != null) {
            if (this.areaType == AreaType.PRODUCT_AREA) {
                var invalidNavidentList = this.ownerGroupNavidentList.stream().filter(s -> !s.matches(NAV_IDENT_PATTERN.pattern())).toList();
                if(!invalidNavidentList.isEmpty()){
                    validator.addError(Fields.ownerGroupNavidentList, paOwnerGroupError, "Owner group contained invalid Id(s): " + String.join(" ", invalidNavidentList));
                }
                var hasDuplicates = StreamUtils.duplicates(this.ownerGroupNavidentList, Function.identity());
                if(hasDuplicates){
                    validator.addError(Fields.ownerGroupNavidentList, paOwnerGroupError, "Owner group contained duplicat Id(s): ");

                }
            } else {
                validator.addError(Fields.ownerGroupNavidentList, paOwnerGroupError, "Areas of type " + this.areaType + " cannot contain an owner group");
            }
        }
    }

    public static ProductAreaRequest convertToRequest(ProductArea productArea) {
        var membersStrippedOfLeaderRoles = productArea.getMembers().stream().map(m -> {
            var filteredRoles = m.getRoles().stream()
                    .filter(it -> !it.isLeaderGroupRole())
                    .toList();
            return new PaMemberRequest(m.getNavIdent(), filteredRoles, m.getDescription());

        });

        var membersWithAtLeastOneNonLeaderRole = membersStrippedOfLeaderRoles.filter(m -> !m.getRoles().isEmpty()).toList();

        return ProductAreaRequest.builder()
                .id(productArea.getId().toString())
                .name(productArea.getName())
                .nomId(productArea.getNomId())
                .areaType(productArea.getAreaType())
                .description(productArea.getDescription())
                .slackChannel(productArea.getSlackChannel())
                .tags(productArea.getTags())
                .members(membersWithAtLeastOneNonLeaderRole)
                .ownerGroupNavidentList(productArea.getOwnerGroupNavidentList())
                .status(productArea.getStatus())
                .update(true)
                .build();
    }

}
