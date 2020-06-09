package no.nav.data.team.po.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.validator.RequestElement;
import no.nav.data.team.common.validator.Validator;

import java.util.List;

import static no.nav.data.team.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class ProductAreaRequest implements RequestElement {

    private String id;
    private String name;
    private String description;
    private List<String> tags;
    private List<PaMemberRequest> members;

    private Boolean update;

    @Override
    public void format() {
        setName(trimToNull(name));
        setDescription(trimToNull(description));
        setTags(formatList(tags));
    }

    @Override
    public String getIdentifyingFields() {
        return name;
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(ProductAreaRequest.Fields.id, id);
        validator.checkBlank(ProductAreaRequest.Fields.name, name);
        validator.checkBlank(ProductAreaRequest.Fields.description, description);
        validator.validateType(ProductAreaRequest.Fields.members, members);
    }

}
