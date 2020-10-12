package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.team.domain.TeamRole;

import java.time.LocalDate;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.nullToEmptyList;
import static org.apache.commons.lang3.StringUtils.trimToNull;
import static org.apache.commons.lang3.StringUtils.upperCase;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberRequest implements Validated {

    private String navIdent;
    private List<TeamRole> roles;
    private String description;

    private int teamPercent;
    private LocalDate startDate;
    private LocalDate endDate;

    @Override
    public void format() {
        setNavIdent(upperCase(navIdent));
        setRoles(nullToEmptyList(roles));
        setDescription(trimToNull(description));
        if (teamPercent < 0) {
            setTeamPercent(0);
        }
        if (teamPercent > 100) {
            setTeamPercent(100);
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkPatternRequired(Fields.navIdent, navIdent, Validator.NAV_IDENT_PATTERN);
        validator.checkBlank(Fields.roles, roles.isEmpty() ? null : roles.get(0).name());
    }
}
