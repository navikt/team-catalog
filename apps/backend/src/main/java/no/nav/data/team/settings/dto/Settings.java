package no.nav.data.team.settings.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.validator.Validated;
import no.nav.data.common.validator.Validator;

import java.util.UUID;

@FieldNameConstants
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Settings implements Validated, DomainObject {

    @JsonIgnore
    private UUID id;
    private String frontpageMessage;
    private ChangeStamp changeStamp;

    @Override
    public void validateFieldValues(Validator<?> validator) {

    }
}
