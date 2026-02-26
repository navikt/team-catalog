package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static no.nav.data.common.validator.Validator.NAV_IDENT_PATTERN;
import static no.nav.data.team.po.dto.ProductAreaRequest.paOwnerGroupError;
import static org.apache.commons.lang3.StringUtils.upperCase;

@Data
@Builder
@NoArgsConstructor(onConstructor_ = @JsonCreator)
@AllArgsConstructor
@FieldNameConstants
public class PaOwnerGroupRequest implements Validated {
    private String ownerNavId;
    @JsonIgnore
    private Map<String, List<String>> nomOwnerGroupMemberOrganizationNameMap;
    private List<String> nomOwnerGroupMemberNavIdList;
    private List<String> ownerGroupMemberNavIdList;

    @Override
    public void format() {
        setOwnerNavId(upperCase(ownerNavId));
        ownerGroupMemberNavIdList = StreamUtils.nullToEmptyList(ownerGroupMemberNavIdList);
        setOwnerGroupMemberNavIdList(ownerGroupMemberNavIdList.stream().map(StringUtils::upperCase).collect(Collectors.toList()));
        nomOwnerGroupMemberNavIdList = StreamUtils.nullToEmptyList(nomOwnerGroupMemberNavIdList);
        setNomOwnerGroupMemberNavIdList(nomOwnerGroupMemberNavIdList.stream().map(StringUtils::upperCase).collect(Collectors.toList()));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        checkPaOwnerGroupField(validator);
    }

    private void checkPaOwnerGroupField(Validator<?> validator) {
        if (this.ownerGroupMemberNavIdList == null) return;

        var noOwnerAndNonzeroMemberCount = this.ownerNavId == null && !this.ownerGroupMemberNavIdList.isEmpty();
        if (noOwnerAndNonzeroMemberCount) {
            validator.addError(Fields.ownerGroupMemberNavIdList, paOwnerGroupError, "OwnerId was null while list of owner group members was non-empty");
            return;
        }

        var ownerAlsoInOwnerGroup = this.ownerNavId != null && this.ownerGroupMemberNavIdList.contains(this.ownerNavId);
        if (ownerAlsoInOwnerGroup) {
            validator.addError(Fields.ownerGroupMemberNavIdList, paOwnerGroupError, "Owner cannot also be member of the owner group");
        }

        var badIdsInOwnerGroup = this.ownerGroupMemberNavIdList.stream().filter(it -> !it.matches(NAV_IDENT_PATTERN.pattern())).toList();
        if (!badIdsInOwnerGroup.isEmpty()) {
            validator.addError(Fields.ownerGroupMemberNavIdList, paOwnerGroupError, "Owner group contained invalid Id(s): " + badIdsInOwnerGroup);
        }

        var duplicatesInOwnerGroup = StreamUtils.duplicates(this.ownerGroupMemberNavIdList, Function.identity());
        if (duplicatesInOwnerGroup) {
            validator.addError(Fields.ownerGroupMemberNavIdList, paOwnerGroupError, "Duplicate IDs in owner group");
        }
    }
}
