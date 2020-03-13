package no.nav.data.team.common.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import com.microsoft.aad.msal4j.AuthorizationCodeParameters;
import com.microsoft.aad.msal4j.ClientCredentialParameters;
import com.microsoft.aad.msal4j.IAuthenticationResult;
import com.microsoft.aad.msal4j.IConfidentialClientApplication;
import com.microsoft.aad.msal4j.OnBehalfOfParameters;
import com.microsoft.aad.msal4j.RefreshTokenParameters;
import com.microsoft.aad.msal4j.UserAssertion;
import com.microsoft.azure.spring.autoconfigure.aad.AADAuthenticationProperties;
import com.microsoft.azure.spring.autoconfigure.aad.AzureADGraphClient;
import com.microsoft.azure.spring.autoconfigure.aad.ServiceEndpointsProperties;
import com.microsoft.azure.spring.autoconfigure.aad.UserGroup;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.TechnicalException;
import no.nav.data.team.common.security.domain.Auth;
import no.nav.data.team.common.security.dto.Credential;
import no.nav.data.team.common.security.dto.TeamRole;
import no.nav.data.team.common.utils.MetricUtils;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Objects.requireNonNull;
import static no.nav.data.team.common.security.dto.TeamRole.ROLE_PREFIX;
import static no.nav.data.team.common.security.dto.TeamRole.TEAM_ADMIN;
import static no.nav.data.team.common.security.dto.TeamRole.TEAM_READ;
import static no.nav.data.team.common.security.dto.TeamRole.TEAM_WRITE;
import static no.nav.data.team.common.utils.StreamUtils.convert;

@Slf4j
@Service
public class AzureTokenProvider {

    public static final String MICROSOFT_GRAPH_SCOPE = "https://graph.microsoft.com/";
    // disable group until avail
    public static final Set<String> MICROSOFT_GRAPH_SCOPES = Set.of(MICROSOFT_GRAPH_SCOPE + "user.read"/*, MICROSOFT_GRAPH_SCOPE + "groupmember.read.all"*/);
    private static final String TOKEN_TYPE = "Bearer ";
    private static final int SESS_ID_LEN = 32;

    private final Cache<String, IAuthenticationResult> accessTokenCache;
    private final LoadingCache<String, Set<GrantedAuthority>> grantedAuthorityCache;

    private final IConfidentialClientApplication msalClient;
    private final AzureADGraphClient graphClient;
    private final AuthService authService;

    private final AADAuthenticationProperties aadAuthProps;
    private final SecurityProperties securityProperties;
    private final ClientRegistration clientRegistration;

    public AzureTokenProvider(AADAuthenticationProperties aadAuthProps,
            IConfidentialClientApplication msalClient, AuthService authService,
            ServiceEndpointsProperties serviceEndpointsProperties,
            SecurityProperties securityProperties,
            ClientRegistrationRepository clientRegistrationRepository) {
        this.aadAuthProps = aadAuthProps;
        this.msalClient = msalClient;
        this.authService = authService;
        this.securityProperties = securityProperties;
        this.clientRegistration = clientRegistrationRepository.findByRegistrationId("azure");

        this.graphClient = new AzureADGraphClient(aadAuthProps.getClientId(), aadAuthProps.getClientSecret(), aadAuthProps, serviceEndpointsProperties);

        this.accessTokenCache = Caffeine.newBuilder().recordStats()
                .expireAfter(new AuthResultExpiry())
                .maximumSize(1000).build();
        this.grantedAuthorityCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(1000).build(this::lookupGrantedAuthorities);
        MetricUtils.register("accessTokenCache", accessTokenCache);
        MetricUtils.register("grantedAuthorityCache", grantedAuthorityCache);
    }

    public String getIdentClaimName() {
        return securityProperties.getIdentClaim();
    }

    public String getConsumerToken(String resource, String appIdUri) {
        return Credential.getCredential()
                .filter(Credential::hasAuth)
                .map(cred -> TOKEN_TYPE + getAccessTokenForResource(cred.getAuth().decryptRefreshToken(), resource))
                .orElseGet(() -> TOKEN_TYPE + getApplicationTokenForResource(appIdUri));
    }

    public Auth getAuth(String session) {
        Assert.isTrue(session.length() > SESS_ID_LEN, "invalid session");
        var sessionId = session.substring(0, SESS_ID_LEN);
        var sessionKey = session.substring(SESS_ID_LEN);
        var auth = authService.getAuth(sessionId, sessionKey);
        String accessToken = getAccessTokenForResource(auth.decryptRefreshToken(), resourceForAppId());
        auth.addAccessToken(accessToken);
        return auth;
    }

    public void destroySession() {
        Credential.getCredential().map(Credential::getAuth).ifPresent(auth -> authService.endSession(auth.getId()));
    }

    // TODO disabled until token v2 can retrieve teams
    //    public Set<GrantedAuthority> getGrantedAuthorities(String accessToken) {
//        return grantedAuthorityCache.get(accessToken);
//    }

    public Set<GrantedAuthority> getGrantedAuthorities(String accessToken) {
        return Set.of(
                new SimpleGrantedAuthority(ROLE_PREFIX + TEAM_READ),
                new SimpleGrantedAuthority(ROLE_PREFIX + TEAM_WRITE),
                new SimpleGrantedAuthority(ROLE_PREFIX + TEAM_ADMIN)
        );
    }

    @SneakyThrows
    public String createSession(String code, String redirectUri) {
        try {
            log.debug("Looking up token for auth code");
            var authResult = msalClient.acquireToken(AuthorizationCodeParameters
                    .builder(code, new URI(redirectUri))
                    .scopes(clientRegistration.getScopes())
                    .build()).get();
            String refreshToken = getRefreshTokenFromAuthResult(authResult);
            return authService.createAuth(authResult.account().homeAccountId(), refreshToken);
        } catch (Exception e) {
            log.error("Failed to get token for auth code", e);
            throw new TechnicalException("Failed to get token for auth code", e);
        }
    }

    private String getRefreshTokenFromAuthResult(IAuthenticationResult authResult) throws ClassNotFoundException, IllegalAccessException, InvocationTargetException {
        // interface is missing refreshToken...
        Method refreshTokenMethod = ReflectionUtils.findMethod(Class.forName("com.microsoft.aad.msal4j.AuthenticationResult"), "refreshToken");
        Assert.notNull(refreshTokenMethod, "couldn't find refreshToken method");
        refreshTokenMethod.setAccessible(true);
        return (String) refreshTokenMethod.invoke(authResult);
    }

    private String resourceForAppId() {
        return aadAuthProps.getClientId() + "/.default";
    }

    private Set<GrantedAuthority> lookupGrantedAuthorities(String token) {
        try {
            String graphToken = acquireGraphToken(token).accessToken();
            List<UserGroup> groups = graphClient.getGroups(graphToken);
            log.debug("groups {}", convert(groups, UserGroup::getDisplayName));
            Set<GrantedAuthority> roles = groups.stream()
                    .map(this::roleFor)
                    .filter(Objects::nonNull)
                    .map(this::convertAuthority)
                    .collect(Collectors.toSet());
            roles.add(convertAuthority(TeamRole.TEAM_READ.name()));
            log.debug("roles {}", convert(roles, GrantedAuthority::getAuthority));
            return roles;
        } catch (Exception e) {
            log.error("Failed to get groups for token", e);
            throw new TechnicalException("Failed to get groups for token", e);
        }
    }

    private String roleFor(UserGroup group) {
        var groupName = group.getDisplayName();
        if (securityProperties.getWriteGroups().contains(groupName)) {
            return TeamRole.TEAM_WRITE.name();
        }
        if (securityProperties.getAdminGroups().contains(groupName)) {
            return TeamRole.TEAM_ADMIN.name();
        }
        // for future - add team -> system roles here
        return null;
    }

    private GrantedAuthority convertAuthority(String role) {
        return new SimpleGrantedAuthority(ROLE_PREFIX + role);
    }

    private String getApplicationTokenForResource(String resource) {
        log.trace("Getting application token for resource {}", resource);
        return requireNonNull(accessTokenCache.get("credential" + resource, cacheKey -> acquireTokenByCredential(resource))).accessToken();
    }

    private String getAccessTokenForResource(String refreshToken, String resource) {
        log.trace("Getting access token for resource {}", resource);
        return requireNonNull(accessTokenCache.get("refresh" + refreshToken + resource, cacheKey -> acquireTokenByRefreshToken(refreshToken, resource))).accessToken();
    }

    private IAuthenticationResult acquireTokenByRefreshToken(String refreshToken, String resource) {
        try {
            log.debug("Looking up access token for resource {}", resource);
            return msalClient.acquireToken(RefreshTokenParameters.builder(Set.of(resource), refreshToken).build()).get();
        } catch (Exception e) {
            throw new TechnicalException("Failed to get access token for refreshToken", e);
        }
    }

    private IAuthenticationResult acquireTokenByCredential(String resource) {
        try {
            log.debug("Looking up application token for resource {}", resource);
            return msalClient.acquireToken(ClientCredentialParameters.builder(Set.of(resource)).build()).get();
        } catch (Exception e) {
            throw new TechnicalException("Failed to get access token for credential", e);
        }
    }

    private IAuthenticationResult acquireGraphToken(String token) {
        try {
            log.debug("Looking up graph token");
            return msalClient.acquireToken(OnBehalfOfParameters
                    .builder(MICROSOFT_GRAPH_SCOPES, new UserAssertion(token))
                    .build()).get();
        } catch (Exception e) {
            throw new TechnicalException("Failed to get graph token", e);
        }
    }
}
