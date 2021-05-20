package no.nav.data.team.resource;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "client.nom.graphql")
public class NomGraphQLProperties {

    private String url;

}
