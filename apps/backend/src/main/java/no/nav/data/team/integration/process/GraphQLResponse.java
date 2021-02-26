package no.nav.data.team.integration.process;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

import java.util.Map;

@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public record GraphQLResponse(
        Map<String, Object> data
) {

    public <T> T get(String queryName, Class<T> type) {
        return (T) data.get(queryName);
    }

    public <T> Map<String, T> getAll(Class<T> type) {
        return (Map<String, T>) data;
    }
}
