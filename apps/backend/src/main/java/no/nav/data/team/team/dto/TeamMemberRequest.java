package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.validator.Validated;
import no.nav.data.team.common.validator.Validator;
import org.apache.commons.lang3.StringUtils;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberRequest implements Validated {

    private String navIdent;
    private String role;

    @Override
    public void format() {
        setNavIdent(StringUtils.upperCase(navIdent));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkPattern(Fields.navIdent, navIdent, Validator.NAV_IDENT_PATTERN);
        validator.checkBlank(Fields.role, role);
    }
}
