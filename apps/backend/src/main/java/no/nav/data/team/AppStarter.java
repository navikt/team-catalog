package no.nav.data.team;

import com.microsoft.azure.spring.autoconfigure.aad.AADOAuth2AutoConfiguration;
import no.nav.data.team.common.exceptions.TechnicalException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@ConfigurationPropertiesScan
@SpringBootApplication(exclude = {AADOAuth2AutoConfiguration.class})
public class AppStarter {

    public static void main(String[] args) {
        readAzureSecret();
        SpringApplication.run(AppStarter.class, args);
    }

    private static void readAzureSecret() {
        fileToProp("/var/run/secrets/nais.io/azuread/secret", "AZURE_CLIENT_ID");
        fileToProp("/var/run/secrets/nais.io/azuread/client_id", "AZURE_CLIENT_SECRET");
    }

    private static void fileToProp(String file, String prop) {
        Path path = Paths.get(file);
        try {
            if (Files.exists(path)) {
                String content = Files.readString(path);
                System.setProperty(prop, content);
            }
        } catch (Exception e) {
            throw new TechnicalException("Couldn't read file " + file);
        }
    }

}
