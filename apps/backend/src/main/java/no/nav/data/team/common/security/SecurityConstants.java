package no.nav.data.team.common.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.Set;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SecurityConstants {

    public static final String COOKIE_NAME = "session";
    // UUID hex without dashes
    public static final int SESS_ID_LEN = 32;
    public static final String TOKEN_TYPE = "Bearer ";

    public static final String REGISTRATION_ID = "azure";
    public static final String APPID_CLAIM = "appid";
    public static final String APPID_CLAIM_V2 = "azp";
    public static final String VER_CLAIM = "ver";
    public static final String USER_ID_CLAIM = "oid";

    public static final String MICROSOFT_GRAPH_SCOPE = "https://graph.microsoft.com/";
    // disable group until avail
    public static final Set<String> MICROSOFT_GRAPH_SCOPES = Set.of(
            MICROSOFT_GRAPH_SCOPE + "user.read"
            /*, MICROSOFT_GRAPH_SCOPE + "groupmember.read.all"*/
    );

}
