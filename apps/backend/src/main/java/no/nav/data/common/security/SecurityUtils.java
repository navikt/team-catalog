package no.nav.data.common.security;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ForbiddenException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.security.dto.UserInfo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Stream;

@Slf4j
@Component
public class SecurityUtils {

    public Optional<UserInfo> getCurrentUser() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .map(authentication -> authentication.getDetails() instanceof UserInfo ui ? ui : null);
    }

    public Optional<String> lookupCurrentIdent() {
        return getCurrentUser().map(UserInfo::getIdent);
    }

    public String getCurrentIdent() {
        return lookupCurrentIdent().orElseThrow(() -> new ValidationException("Invalid user, no ident found"));
    }

    public boolean isAdmin() {
        return getCurrentUser().map(UserInfo::isAdmin).orElse(false);
    }

    public boolean isUserOrAdmin(String ident) {
        return getCurrentIdent().equals(ident) || isAdmin();
    }

    public void assertIsUserOrAdmin(String ident, String message) {
        if (!isUserOrAdmin(ident)) {
            throw new ForbiddenException(message);
        }
    }

    public void assertAuthIsPermittedApp(String permittedAppNamespace, String permittedAppName) {
        var isAcceptedAppArgsValid = Stream.of(permittedAppNamespace, permittedAppName).anyMatch(s -> s != null && !s.isEmpty());
        if (!isAcceptedAppArgsValid) {
            throw new IllegalArgumentException("Badly specified namespace and/or appname");
        }

        var forbiddenException = new ForbiddenException("This endpoint is only available for " + permittedAppNamespace + "." + permittedAppName);
        var callingAppName = this.getCurrentUser()
                .map(UserInfo::getAppName)
                .map(it -> it.replaceAll(":", "."))
                .orElseThrow(() -> {
                    log.info("assertAuthIsPermittedApp triggered. ould not retrieve caller app name.  Desired app: {}.{} , ", permittedAppNamespace, permittedAppName);
                    return forbiddenException;
                });

        var acceptedAppNames = Stream.of("prod", "dev").map(clusterName -> String.format("%s-gcp.%s.%s", clusterName, permittedAppNamespace, permittedAppName))
                .toList();

        if (!acceptedAppNames.contains(callingAppName)) {
            log.info("assertAuthIsPermittedApp triggered. Desired app: {}.{} vs actual app: {}}",permittedAppNamespace,permittedAppName, callingAppName);
            throw forbiddenException;
        }
    }
}
