package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.validator.RequestElement;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.team.domain.TeamType;

import java.util.List;

import static no.nav.data.team.common.utils.StreamUtils.nullToEmptyList;
import static no.nav.data.team.common.validator.Validator.NAV_IDENT_PATTERN;
import static org.apache.commons.lang3.StringUtils.trimToNull;
import static org.apache.commons.lang3.StringUtils.upperCase;

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
    private String teamLeader;
    private TeamType teamType;
    private boolean teamLeadQA;
    private List<String> naisTeams;
    private List<TeamMemberRequest> members;

    private Boolean update;

    @Override
    public String getIdentifyingFields() {
        return name;
    }

    @Override
    public void format() {
        setName(trimToNull(name));
        setDescription(trimToNull(description));
        setSlackChannel(trimToNull(slackChannel));
        setProductAreaId(trimToNull(productAreaId));
        setTeamLeader(upperCase(trimToNull(teamLeader)));
        setNaisTeams(nullToEmptyList(naisTeams));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.productAreaId, productAreaId);
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
        validator.checkPattern(Fields.teamLeader, teamLeader, NAV_IDENT_PATTERN);
        validator.validateType(Fields.members, members);
    }
}
