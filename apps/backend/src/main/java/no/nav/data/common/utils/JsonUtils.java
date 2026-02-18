package no.nav.data.common.utils;

import no.nav.data.common.exceptions.TechnicalException;
import org.springframework.core.ParameterizedTypeReference;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Map;

public final class JsonUtils {

    public static final ParameterizedTypeReference<List<String>> STRING_LIST = new ParameterizedTypeReference<>() {
    };
    public static final ParameterizedTypeReference<List<String>> INT_LIST = new ParameterizedTypeReference<>() {
    };

    private JsonUtils() {
    }

    private static final JsonMapper jsonMapper = createJsonMapper();
    private static final TypeReference<Map<String, Object>> MAP_TYPE_REFERENCE = new TypeReference<>() {
    };

    public static JsonMapper createJsonMapper() {
        return new JsonMapper(JsonMapper.builder().disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES));
    }

    public static JsonMapper getJsonMapper() {
        return jsonMapper;
    }

    public static JsonNode toJsonNode(String json) {
        try {
            return jsonMapper.readTree(json);
        } catch (JacksonException e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
    }

    public static Map toMap(Object object) {
        return jsonMapper.convertValue(object, MAP_TYPE_REFERENCE);
    }

    public static <T> T toObject(String jsonString, TypeReference<T> reference) {
        try {
            return jsonMapper.readValue(jsonString, reference);
        } catch (Exception e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
    }

    public static <T> T toObject(String jsonPayload, Class<T> type) {
        try {
            return jsonMapper.readValue(jsonPayload, type);
        } catch (JacksonException e) {
            throw new IllegalArgumentException("invalid json ", e);
        }
    }

    public static String toJson(Object object) {
        try {
            return jsonMapper.writeValueAsString(object);
        } catch (JacksonException e) {
            throw new IllegalArgumentException("cannot convert to json", e);
        }
    }

    public static <T> T readValue(String jsonString, TypeReference<T> type) {
        try {
            return jsonMapper.readValue(jsonString, type);
        } catch (Exception e) {
            throw new TechnicalException("json error", e);
        }
    }

    public static <T> T toObject(JsonNode jsonNode, Class<T> clazz) {
        try {
            return jsonMapper.treeToValue(jsonNode, clazz);
        } catch (JacksonException e) {
            throw new TechnicalException("cannot create object from json", e);
        }
    }

    public static JsonNode toJsonNode(Object object) {
        return jsonMapper.valueToTree(object);
    }

    @SuppressWarnings("unchecked")
    public static <T> T cloneObject(T object) {
        return (T) toObject(toJsonNode(object), object.getClass());
    }

}
