package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.common.validator.RequestElement;
import no.nav.data.team.common.validator.Validator;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class TeamRequest implements RequestElement {

    private String id;
    private String name;
    private String description;
    private String slackChannel;
    private String productAreaId;
    private List<String> naisTeams;
    private List<TeamMemberRequest> members;

    private Boolean update;

    @Override
    public String getIdentifyingFields() {
        return name;
    }

    @Override
    public void format() {
        naisTeams = StreamUtils.nullToEmptyList(naisTeams);
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.productAreaId, productAreaId);
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
        validator.validateType(Fields.members, members);
    }
}
