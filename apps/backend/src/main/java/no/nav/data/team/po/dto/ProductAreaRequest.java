package no.nav.data.team.po.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.po.domain.AreaType;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.nullToEmptyList;
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
    private AreaType areaType;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private List<PaMemberRequest> members;
    private PaOwnerGroupRequest ownerGroup;

    private Boolean update;

    @Override
    public void format() {
        setName(trimToNull(name));
        setDescription(trimToNull(description));
        setSlackChannel(trimToNull(slackChannel));
        setTags(formatList(tags));
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


}
