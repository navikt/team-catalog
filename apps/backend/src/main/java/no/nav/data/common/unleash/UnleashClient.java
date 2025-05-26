package no.nav.data.common.unleash;

import io.getunleash.DefaultUnleash;
import io.getunleash.UnleashContext;
import io.getunleash.util.UnleashConfig;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.azure.AzureUserInfo;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@Profile("!test")
public class UnleashClient {

    private final DefaultUnleash client;

    public UnleashClient(Environment environment) {

        UnleashConfig config = UnleashConfig.builder()
                .appName("team-catalog-backend")
                .unleashAPI(environment.getRequiredProperty("UNLEASH_SERVER_API_URL") + "/api")
                .apiKey(environment.getRequiredProperty("UNLEASH_SERVER_API_TOKEN"))
                .environment(environment.getRequiredProperty("UNLEASH_SERVER_API_ENV"))
                .unleashContextProvider(() -> UnleashContext.builder()
                        .userId(getUserNavident().orElse("Missing-Navident"))
                        .build())
                .build();

        this.client = new DefaultUnleash(config);
    }

    private Optional<String> getUserNavident() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            var maybeUserInfo = auth.getDetails();
            if (maybeUserInfo instanceof AzureUserInfo userInfo) {
                return Optional.ofNullable(userInfo.getIdent());
            }
        }
        return Optional.empty();
    }

    public boolean isEnabled(String toggleName) {
        return this.client.isEnabled(toggleName);
    }
}
