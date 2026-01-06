package no.nav.data.common.security;

import no.nav.data.common.exceptions.ForbiddenException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.security.dto.UserInfo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

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

}
