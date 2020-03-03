package no.nav.data.team.common.jpa;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladmihalcea.hibernate.type.util.ObjectMapperSupplier;
import no.nav.data.team.common.utils.JsonUtils;

public class JsonbOMSupplier implements ObjectMapperSupplier {

    @Override
    public ObjectMapper get() {
        return JsonUtils.getObjectMapper();
    }
}
