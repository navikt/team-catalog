package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.team.domain.TeamType;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.nullToEmptyList;
import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

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
    private TeamType teamType;
    private boolean teamLeadQA;
    private List<String> naisTeams;
    private List<TeamMemberRequest> members;
    private List<String> tags;
    private List<Location> locations;

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
        setNaisTeams(formatList(naisTeams));
        setTags(formatList(tags));
        setLocations(nullToEmptyList(locations));
        if (teamType == null) {
            setTeamType(TeamType.UNKNOWN);
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.productAreaId, productAreaId);
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
        validator.validateType(Fields.members, members);
        validator.validateType(Fields.locations, locations);
    }
}
