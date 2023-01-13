package no.nav.data.team.naisteam.console;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("client.nais.console")
public record NaisConsoleProperties(
        ConsoleAuth auth,
        String baseUrl
) {

    public record ConsoleAuth(String token) {}

}
