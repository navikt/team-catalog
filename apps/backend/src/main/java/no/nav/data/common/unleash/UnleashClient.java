package no.nav.data.common.unleash;

import io.getunleash.DefaultUnleash;
import io.getunleash.MoreOperations;
import io.getunleash.Unleash;
import io.getunleash.UnleashContext;
import io.getunleash.util.UnleashConfig;
import io.getunleash.variant.Variant;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.azure.AzureUserInfo;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;
import java.util.function.BiPredicate;

@Slf4j
@Service
@Profile("!test")
public class UnleashClient {

    private final Unleash client;

    public UnleashClient(Environment environment) {
        if(Arrays.asList(environment.getActiveProfiles()).contains("local")) {
            // dummy unleash when local
            this.client = new Unleash(){

                @Override
                public boolean isEnabled(String s, UnleashContext unleashContext, BiPredicate<String, UnleashContext> biPredicate) {
                    return false;
                }

                @Override
                public Variant getVariant(String s, UnleashContext unleashContext) {
                    return null;
                }

                @Override
                public Variant getVariant(String s, UnleashContext unleashContext, Variant variant) {
                    return null;
                }

                @Override
                public MoreOperations more() {
                    return null;
                }
            };
            return;
        }

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
