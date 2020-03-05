package no.nav.data.team.team.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.common.validator.RequestElement;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
@JsonPropertyOrder({"id", "name", "description", "slackChannel", "productAreaId", "naisTeams"})
public class TeamRequest implements RequestElement {

    private String id;
    private String name;
    private String description;
    private String slackChannel;
    private String productAreaId;
    private List<String> naisTeams;

    private Boolean update;

    @Override
    public String getIdentifyingFields() {
        return name;
    }

    @Override
    public void validateFieldValues(Validator validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
    }
}
