package no.nav.data.team.po.dto;


import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;

import static no.nav.data.common.validator.Validator.NAV_IDENT_PATTERN;
import static no.nav.data.team.po.dto.ProductAreaRequest.paOwnerGroupError;
import static org.apache.commons.lang3.StringUtils.upperCase;

@Data
@Getter
@Builder
@FieldNameConstants
public class PaOwnerGroupRequest implements Validated {
    private String ownerNavId;
    private List<String> ownerGroupMemberNavIdList;

    public PaOwnerGroupRequest(){
        this.ownerNavId = null;
        this.ownerGroupMemberNavIdList = null;
    }

    public PaOwnerGroupRequest(String ownerNavId, List<String> ownerGroupMemberNavIdList){
        this.ownerNavId = ownerNavId;
        this.ownerGroupMemberNavIdList = new ArrayList<>(ownerGroupMemberNavIdList);
    }

    @Override
    public void format() {
        setOwnerNavId(upperCase(ownerNavId));
        StreamUtils.nullToEmptyList(ownerGroupMemberNavIdList);
        setOwnerGroupMemberNavIdList(ownerGroupMemberNavIdList.stream().map(StringUtils::upperCase).toList());
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        checkPaOwnerField(validator);
        checkPaOwnerGroupField(validator);
    }


    private void checkPaOwnerField(Validator<?> validator) {
        // either null or is a valid ID
        if (this.ownerNavId != null) {
            if (!this.ownerNavId.matches(NAV_IDENT_PATTERN.pattern())) {
                validator.addError(Fields.ownerNavId, "badId", "Id is wrongly formatted: " + this.ownerNavId);
            }
        }
    }
//
    private void checkPaOwnerGroupField(Validator<?> validator) {
        if(this.ownerGroupMemberNavIdList == null) return;

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
        if (badIdsInOwnerGroup.size() != 0) {
            validator.addError(Fields.ownerGroupMemberNavIdList, paOwnerGroupError, "Owner group contained invalid Id(s): " + badIdsInOwnerGroup.toString());
        }

        var origSize = this.ownerGroupMemberNavIdList.size();
        var sizeWithoutDupes = this.ownerGroupMemberNavIdList.stream().distinct().count();
        var duplicatesInOwnerGroup = origSize != sizeWithoutDupes;
        if (duplicatesInOwnerGroup) {
            validator.addError(Fields.ownerGroupMemberNavIdList, paOwnerGroupError, "Duplicate IDs in owner group");
        }
    }
}
