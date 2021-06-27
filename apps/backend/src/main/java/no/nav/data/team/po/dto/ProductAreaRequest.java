package no.nav.data.team.po.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.OwnerRole;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.nullToEmptyList;
import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class ProductAreaRequest implements RequestElement {

    private String id;
    private String name;
    private AreaType areaType;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private List<PaMemberRequest> members;
    private List<Location> locations;

    private List<PaOwnerRequest> owners;

    private Boolean update;

    @Override
    public void format() {
        setName(trimToNull(name));
        setDescription(trimToNull(description));
        setSlackChannel(trimToNull(slackChannel));
        setTags(formatList(tags));
        setLocations(nullToEmptyList(locations));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
        validator.validateType(Fields.members, members);
        validator.validateType(Fields.locations, locations);
        validator.validateType(Fields.owners, owners);

        checkOwnerList(validator);

    }


    private void checkOwnerList(Validator<?> validator) {
        var ownerListSize = this.owners.size();
        if (ownerListSize > 0) {
            var ownerLeadCount = this.owners.stream().filter(it -> it.getRole().equals(OwnerRole.OWNER_LEAD)).count();
            if (ownerLeadCount != 1) {
                validator.addError(Fields.owners,
                        "occurenceCountIllegal",
                        "Non-empty owner group must contain exactly one leader (primary owner)");
            }
        }
    }

}
