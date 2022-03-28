package no.nav.data.team.cluster.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.shared.domain.DomainObjectStatus;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class ClusterRequest implements RequestElement {

    private String id;
    private String name;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private String productAreaId;
    private List<ClusterMemberRequest> members;

    private DomainObjectStatus status;

    private Boolean update;

    public UUID productAreaIdAsUUID() {
        return productAreaId != null ? UUID.fromString(productAreaId) : null;
    }

    @Override
    public void format() {
        setName(trimToNull(name));
        setDescription(trimToNull(description));
        setSlackChannel(trimToNull(slackChannel));
        setTags(formatList(tags));
        setProductAreaId(trimToNull(productAreaId));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
        validator.validateType(Fields.members, members);
        validator.checkUUID(Fields.productAreaId, productAreaId);
    }
}
