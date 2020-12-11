package no.nav.data.team.notify;

import no.nav.data.common.security.SecurityProperties;

import java.util.List;

/**
 * Litt uheldig oppsett pga configstyrt static utility, litt som NomClient ref {@link no.nav.data.team.resource.NomMock}
 */
public class UrlGeneratorTestUtil {

    public static SecurityProperties getSecurityProperties() {
        SecurityProperties securityProperties = new SecurityProperties();
        securityProperties.setRedirectUris(List.of("http://localhost:3000"));
        securityProperties.setEnv("dev-fss");
        return securityProperties;
    }

    public static UrlGenerator get() {
        return new UrlGenerator(getSecurityProperties());
    }

}