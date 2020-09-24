package no.nav.data.team.po.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class AddTeamsToProductAreaRequest implements Validated {

    private String productAreaId;
    private List<String> teamIds;

    @Override
    public void format() {
        setTeamIds(StreamUtils.nullToEmptyList(teamIds));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkBlank(Fields.productAreaId, productAreaId);
        validator.checkUUID(Fields.productAreaId, productAreaId);
        teamIds.forEach(id -> validator.checkUUID(Fields.teamIds, id));
    }

    public UUID productAreaIdAsUUID() {
        return productAreaId != null ? UUID.fromString(productAreaId) : null;
    }
}
