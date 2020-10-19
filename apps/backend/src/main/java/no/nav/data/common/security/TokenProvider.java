package no.nav.data.common.security;

public interface TokenProvider {

    String createSession(String code, String fullRequestUrlWithoutQuery);

    void destroySession();

    String createAuthRequestRedirectUrl(String usedRedirect, String errorUri, String redirectUri);
}
