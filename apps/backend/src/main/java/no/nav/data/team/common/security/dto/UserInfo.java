package no.nav.data.team.common.security.dto;

import com.microsoft.azure.spring.autoconfigure.aad.UserPrincipal;
import lombok.Value;
import no.nav.data.team.common.security.AppIdMapping;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;

import java.util.List;
import java.util.Set;

import static no.nav.data.team.common.security.SecurityConstants.APPID_CLAIM;
import static no.nav.data.team.common.security.SecurityConstants.APPID_CLAIM_V2;
import static no.nav.data.team.common.security.SecurityConstants.USER_ID_CLAIM;
import static no.nav.data.team.common.security.SecurityConstants.VER_CLAIM;
import static no.nav.data.team.common.security.dto.TeamRole.ROLE_PREFIX;
import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.copyOf;
import static org.apache.commons.lang3.StringUtils.substringAfter;

@Value
public class UserInfo {

    String appId;
    String userId;
    String ident;
    String name;
    String email;
    List<String> groups;

    public UserInfo(UserPrincipal principal, Set<GrantedAuthority> grantedAuthorities, String identClaimName) {
        this.appId = getAppId(principal);
        this.ident = getIdent(principal, identClaimName);
        this.userId = getUserId(principal);

        this.name = principal.getName();
        this.email = getEmail(principal);
        groups = convert(grantedAuthorities, grantedAuthority -> substringAfter(grantedAuthority.getAuthority(), ROLE_PREFIX));
    }

    public static String getAppId(UserPrincipal principal) {
        if (isV1(principal)) {
            return (String) principal.getClaim(APPID_CLAIM);
        }
        return (String) principal.getClaim(APPID_CLAIM_V2);
    }

    public static String getUserId(UserPrincipal principal) {
        return (String) principal.getClaim(USER_ID_CLAIM);
    }

    private String getEmail(UserPrincipal principal) {
        if (isV1(principal)) {
            return principal.getUniqueName();
        }
        return (String) principal.getClaim(StandardClaimNames.PREFERRED_USERNAME);
    }

    private static boolean isV1(UserPrincipal principal) {
        return "1.0".equals(getClaim(principal, VER_CLAIM));
    }

    public String formatUser() {
        return String.format("%s - %s", ident, name);
    }

    public String getAppName() {
        return AppIdMapping.getAppNameForAppId(appId);
    }

    private static String getIdent(UserPrincipal principal, String identClaimName) {
        String identClaim = getClaim(principal, identClaimName);
        return identClaim == null ? "missing-ident" : identClaim;
    }

    @SuppressWarnings("unchecked")
    private static <T> T getClaim(UserPrincipal principal, String claim) {
        return (T) principal.getClaim(claim);
    }

    public UserInfoResponse convertToResponse() {
        return UserInfoResponse.builder()
                .loggedIn(true)
                .ident(ident)
                .name(name)
                .email(email)
                .groups(copyOf(groups))
                .build();
    }
}
