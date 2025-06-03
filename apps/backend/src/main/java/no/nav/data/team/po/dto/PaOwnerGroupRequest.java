package no.nav.data.team.po.dto;

import lombok.*;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import static no.nav.data.common.validator.Validator.NAV_IDENT_PATTERN;
import static no.nav.data.team.po.dto.ProductAreaRequest.paOwnerGroupError;
import static org.apache.commons.lang3.StringUtils.upperCase;

@Data
@Getter
@Builder
@FieldNameConstants
public class PaOwnerGroupRequest implements Validated {
    private String ownerNavId;
    private List<String> nomOwnerGroupMemberNavIdList;
    private List<String> ownerGroupMemberNavIdList;

    public PaOwnerGroupRequest() {
        this.ownerNavId = null;
        this.nomOwnerGroupMemberNavIdList = null;
        this.ownerGroupMemberNavIdList = null;
    }

    public PaOwnerGroupRequest(String ownerNavId, List<String> nomOwnerGroupMemberNavIdList, List<String> ownerGroupMemberNavIdList) {
        this.ownerNavId = ownerNavId;
        this.nomOwnerGroupMemberNavIdList = new ArrayList<>(nomOwnerGroupMemberNavIdList);
        this.ownerGroupMemberNavIdList = new ArrayList<>(ownerGroupMemberNavIdList);
    }

    @Override
    public void format() {
        setOwnerNavId(upperCase(ownerNavId));
        ownerGroupMemberNavIdList = StreamUtils.nullToEmptyList(ownerGroupMemberNavIdList);
        setOwnerGroupMemberNavIdList(ownerGroupMemberNavIdList.stream().map(StringUtils::upperCase).toList());
        nomOwnerGroupMemberNavIdList = StreamUtils.nullToEmptyList(nomOwnerGroupMemberNavIdList);
        setNomOwnerGroupMemberNavIdList(nomOwnerGroupMemberNavIdList.stream().map(StringUtils::upperCase).toList());
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
