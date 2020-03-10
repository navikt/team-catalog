package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.validator.Validated;
import no.nav.data.team.common.validator.Validator;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberRequest implements Validated {

    private String nomId;
    private String azureId;
    private String name;
    private String role;

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.role, role);
    }
}
