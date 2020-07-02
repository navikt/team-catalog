package no.nav.data.common.storage.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import no.nav.data.common.rest.ChangeStampResponse;

import java.time.LocalDateTime;
import java.util.UUID;

public interface DomainObject {

    UUID getId();

    void setId(UUID id);

    @JsonIgnore
    ChangeStamp getChangeStamp();

    @JsonIgnore
    void setChangeStamp(ChangeStamp changeStamp);

    default String type() {
        return TypeRegistration.typeOf(getClass());
    }

    default ChangeStampResponse convertChangeStampResponse() {
        if (getChangeStamp() == null) {
            return null;
        }
        return ChangeStampResponse.builder()
                .lastModifiedBy(getChangeStamp().getLastModifiedBy())
                .lastModifiedDate(getChangeStamp().getLastModifiedDate() == null ? LocalDateTime.now() : getChangeStamp().getLastModifiedDate())
                .build();
    }

}
