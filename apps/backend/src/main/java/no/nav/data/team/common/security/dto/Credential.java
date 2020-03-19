package no.nav.data.team.common.security.dto;

import lombok.Value;
import no.nav.data.team.common.security.domain.Auth;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Value
public class Credential {

    String accessToken;
    Auth auth;
    String navIdent;

    public Credential(String accessToken, Auth auth, String navIdent) {
        this.accessToken = accessToken;
        this.auth = auth;
        this.navIdent = navIdent;
    }

    public Credential(String accessToken, String navIdent) {
        this(accessToken, null, navIdent);
    }

    public Credential(Auth auth, String navIdent) {
        this(null, auth, navIdent);
    }

    public boolean hasAuth() {
        return auth != null;
    }

    public String getAccessToken() {
        return hasAuth() ? auth.getAccessToken() : accessToken;
    }

    public static Optional<Credential> getCredential() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .map(authentication -> authentication.getCredentials() instanceof Credential ? (Credential) authentication.getCredentials() : null);
    }
}
