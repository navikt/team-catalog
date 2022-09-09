package no.nav.data;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.TechnicalException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Slf4j
@ConfigurationPropertiesScan
@SpringBootApplication
public class AppStarter {

    public static void main(String[] args) {
        readAzureSecret();
        SpringApplication.run(AppStarter.class, args);
    }

    private static void readAzureSecret() {
        listSecretFiles();
        fileToProp("/var/run/secrets/nais.io/srv/username", "SRV_USER");
        fileToProp("/var/run/secrets/nais.io/srv/password", "SRV_PASSWORD");
    }

    private static void listSecretFiles() {
        var base = Paths.get("/var/run/secrets/nais.io");
        try (Stream<Path> paths = Files.walk(base)) {
            paths.forEach(p -> log.info("Vault file: {}", p.toAbsolutePath()));
        } catch (IOException e) {
            log.error("couldnt list vault files", e);
        }
    }

    private static void fileToProp(String file, String prop) {
        Path path = Paths.get(file);
        try {
            if (Files.exists(path)) {
                log.info("Reading property={} from={}", prop, file);
                String content = Files.readString(path);
                System.setProperty(prop, content);
            }
        } catch (Exception e) {
            throw new TechnicalException("Couldn't read file " + file);
        }
    }

}
