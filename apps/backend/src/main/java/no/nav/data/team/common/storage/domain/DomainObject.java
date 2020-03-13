package no.nav.data.team.common.storage.domain;

import java.util.UUID;

public interface DomainObject {

    UUID getId();

    void setId(UUID id);

    default String type() {
        return TypeRegistration.typeOf(getClass());
    }

}
