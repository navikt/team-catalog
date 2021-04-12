package no.nav.data.team.integration.process;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

import java.util.Map;

@JsonAutoDetect(fieldVisibility = Visibility.ANY)
public record GraphQLRequest(
        String query,
        Map<String, Object> variables
) {

    public GraphQLRequest(String query) {
        this(query, Map.of());
    }
}
