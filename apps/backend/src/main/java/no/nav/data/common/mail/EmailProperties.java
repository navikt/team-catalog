package no.nav.data.common.mail;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("client.email")
public record EmailProperties(
        String baseUrl,
        Integer maxAttempts,
        Integer backoffDurationMillis,
        Boolean enabled
) { }
