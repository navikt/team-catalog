package no.nav.data.common.jpa;

import io.hypersistence.utils.hibernate.type.util.ObjectMapperSupplier;
import no.nav.data.common.utils.JsonUtils;
import tools.jackson.databind.json.JsonMapper;

public class JsonbOMSupplier implements ObjectMapperSupplier {

    @Override
    public JsonMapper get() {
        return JsonUtils.getJsonMapper();
    }
}
