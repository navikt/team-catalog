package no.nav.data.team.settings.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.team.common.storage.domain.DomainObject;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.common.validator.Validated;

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

    @Override
    public void validateFieldValues(Validator<?> validator) {

    }
}
