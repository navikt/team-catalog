package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.validator.RequestElement;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.team.dto.TeamRequest;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
@JsonPropertyOrder({"id", "name", "description"})
public class ProductAreaRequest implements RequestElement {

    private String id;
    private String name;
    private String description;

    private Boolean update;

    @Override
    public String getIdentifyingFields() {
        return name;
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(TeamRequest.Fields.id, id);
        validator.checkBlank(TeamRequest.Fields.name, name);
        validator.checkBlank(TeamRequest.Fields.description, description);
    }

}
