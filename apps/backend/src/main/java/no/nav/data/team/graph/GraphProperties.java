package no.nav.data.team.graph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ConfigurationProperties(prefix = "data.catalog.graph")
public class GraphProperties {

    private String baseUrl;
    private String apiToken;
    private boolean disabled;
}
