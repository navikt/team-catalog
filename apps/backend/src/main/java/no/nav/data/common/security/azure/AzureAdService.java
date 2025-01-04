package no.nav.data.common.security.azure;

import com.microsoft.kiota.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.exceptions.TimeoutException;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.net.SocketTimeoutException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AzureAdService {

    private final AzureTokenProvider azureTokenProvider;

    public byte[] lookupProfilePictureByNavIdent(String navIdent) {
        String userId = lookupUserIdForNavIdent(navIdent);
        return lookupUserProfilePicture(userId);
    }

    private String lookupUserIdForNavIdent(String navIdent) {
        var res = azureTokenProvider.getGraphClient()
                .users()
                .get(requestConfiguration -> {
                        requestConfiguration.queryParameters.select = new String[] {"id"};
                        requestConfiguration.queryParameters.filter = "mailNickname eq '" + navIdent + "'";
                })
                .getValue();
        if (res.size() != 1) {
            log.info("Did not find single user for navIdent {} ({})", navIdent, res.size());
            return null;
        }
        return res.get(0).getId();
    }

    private byte[] lookupUserProfilePicture(String id) {
        try {
            var photo = azureTokenProvider.getGraphClient()
                    .users()
                    .byUserId(id)
                    .photo().content()
                    .get();
            return StreamUtils.copyToByteArray(photo);
        } catch (ApiException e) {
            log.error("error with azure", e);
            throw new TechnicalException("error with azure", e);
        } catch (IOException e) {
            if (e.getCause() instanceof SocketTimeoutException) {
                log.error("Azure request timed out", e);
                throw new TimeoutException("Azure request timed out", e);
            }
            log.error("io error with azure", e);
            throw new TechnicalException("io error with azure", e);
        }
    }
}
