package no.nav.data.common.jpa;

import no.nav.data.common.utils.JsonUtils;
import org.hibernate.type.format.AbstractJsonFormatMapper;
import tools.jackson.databind.json.JsonMapper;

import java.lang.reflect.Type;

/**
 * Hibernate FormatMapper using Jackson 3.x (tools.jackson) instead of Jackson 2.x (com.fasterxml.jackson).
 * Needed because Hibernate 7.x's built-in JacksonJsonFormatMapper uses Jackson 2.x,
 * which cannot handle tools.jackson.databind.JsonNode fields.
 */
public class Jackson3JsonFormatMapper extends AbstractJsonFormatMapper {

    private final JsonMapper jsonMapper;

    public Jackson3JsonFormatMapper() {
        this.jsonMapper = JsonUtils.createJsonMapper();
    }

    @Override
    @SuppressWarnings("unchecked")
    protected <T> T fromString(CharSequence charSequence, Type type) {
        try {
            return (T) jsonMapper.readValue(charSequence.toString(), jsonMapper.constructType(type));
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not deserialize string to java type: " + type, e);
        }
    }

    @Override
    protected <T> String toString(T value, Type type) {
        try {
            return jsonMapper.writerFor(jsonMapper.constructType(type)).writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not serialize object of java type: " + type, e);
        }
    }
}
