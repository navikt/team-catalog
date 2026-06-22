package no.nav.data.team.naisteam;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@ConfigurationProperties("client.nais.console")
public record NaisConsoleProperties(
        ConsoleAuth auth,
        String baseUrl
) {

    public record ConsoleAuth(String token_path) {
        public String getTokenFromPath() {
            try {
                return Files.readString(Path.of(token_path)).strip();
            } catch (IOException e) {
                log.error("Failed to read token from path: " + token_path, e);
                return "";
            }
        }
    }
}
