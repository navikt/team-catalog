package no.nav.data.team.location.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;

@Data
@Builder
@FieldNameConstants
@AllArgsConstructor
@NoArgsConstructor
public class Location implements Validated {

    private String floorId;
    private String locationCode;

    private int x;
    private int y;

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkBlank(Fields.floorId, floorId);
        validator.checkBlank(Fields.locationCode, locationCode);
    }
}