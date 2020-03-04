package no.nav.data.team.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.validator.FieldValidator;
import no.nav.data.team.common.validator.Validated;

@FieldNameConstants
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Settings implements Validated {

    private String frontpageMessage;

    @Override
    public void validate(FieldValidator validator) {

    }
}
