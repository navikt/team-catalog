package no.nav.data.team.common.security;

import no.nav.data.team.common.exceptions.NotFoundException;
import no.nav.data.team.common.security.domain.Auth;
import no.nav.data.team.common.security.domain.AuthRepository;
import no.nav.data.team.common.utils.StringUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final Encryptor encryptor;

    public AuthService(AuthRepository authRepository, Encryptor refreshTokenEncryptor) {
        this.authRepository = authRepository;
        this.encryptor = refreshTokenEncryptor;
    }

    public Auth getAuth(String sessionId, String sessionKey) {
        var sessUuid = StringUtils.toUUID(sessionId);
        return authRepository.findById(sessUuid)
                .orElseThrow(() -> new NotFoundException("couldn't find session"))
                .addSecret(encryptor, sessionKey);
    }

    public String createAuth(String userId, String refreshToken) {
        String saltedCipher = encryptor.encrypt(refreshToken);
        var auth = authRepository.save(Auth.builder()
                .generateId()
                .userId(userId)
                .encryptedRefreshToken(encryptor.getCipher(saltedCipher))
                .initiated(LocalDateTime.now())
                .build())
                .addSecret(encryptor, encryptor.getSalt(saltedCipher));
        return auth.session();
    }

    public void deleteAuth(Auth auth) {
        authRepository.deleteById(auth.getId());
    }
}
