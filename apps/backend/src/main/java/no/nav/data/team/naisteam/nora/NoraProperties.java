package no.nav.data.team.naisteam.nora;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "client.team-nora")
public class NoraProperties {

    private String url;
    private String teamsUrl;
    private String appsUrl;
    private String teamUrl;

}
