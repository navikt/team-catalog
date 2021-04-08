package no.nav.data.common.security;

import lombok.Data;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.utils.StreamUtils.tryFind;

@Data
@Configuration
@ConfigurationProperties(prefix = "team-catalog.security")
public class SecurityProperties {

    private boolean enabled = true;
    private String encKey = "";
    private List<String> writeGroups;
    private List<String> adminGroups;
    private List<String> redirectUris;
    private String env;
    private List<String> devEmailAllowList;

    public boolean isValidRedirectUri(String uri) {
        return uri == null || safeStream(redirectUris).anyMatch(origin -> StringUtils.startsWithIgnoreCase(uri, origin));
    }

    public boolean isDev() {
        return env.startsWith("dev");
    }

    public String findBaseUrl() {
        return tryFind(getRedirectUris(), uri -> uri.contains("adeo.no")).orElse(getRedirectUris().get(0));
    }

    public boolean isDevEmailAllowed(String email) {
        return devEmailAllowList.stream().anyMatch(email::equalsIgnoreCase);
    }
}
