package no.nav.data.common.security.azure;

import com.microsoft.graph.core.ClientException;
import com.microsoft.graph.http.GraphServiceException;
import com.microsoft.graph.models.UserSendMailParameterSet;
import com.microsoft.graph.options.QueryOption;
import com.microsoft.graph.requests.GraphServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.exceptions.TimeoutException;
import no.nav.data.common.mail.EmailProvider;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.azure.support.GraphLogger;
import no.nav.data.common.storage.StorageService;
import okhttp3.Request;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.List;

import static no.nav.data.common.security.azure.AzureConstants.MICROSOFT_GRAPH_SCOPE_APP;
import static no.nav.data.common.security.azure.support.MailMessage.compose;

@Slf4j
@Service
@RequiredArgsConstructor
public class AzureAdService implements EmailProvider {

    private final AzureTokenProvider azureTokenProvider;
    private final SecurityProperties securityProperties;
    private final StorageService storage;

    public byte[] lookupProfilePictureByNavIdent(String navIdent) {
        String userId = lookupUserIdForNavIdent(navIdent);
        return lookupUserProfilePicture(userId);
    }

    @Override
    public void sendMail(MailTask mailTask) {
        log.info("Sending mail {} to {}", mailTask.getSubject(), mailTask.getTo());
        if (securityProperties.isDev()) {
//        if (securityProperties.isDev() && !securityProperties.isDevEmailAllowed(mailTask.getTo())) {
            // disable mail in dev for now due to trygdeetaten.no
            log.info("skipping mail, not allowed in dev");
        } else {
            getMailGraphClient().me()
                    .sendMail(UserSendMailParameterSet.newBuilder()
                            .withMessage(compose(mailTask.getTo(), mailTask.getSubject(), mailTask.getBody()))
                            .withSaveToSentItems(false)
                            .build())
                    .buildRequest()
                    .post();
        }

        storage.save(mailTask.toMailLog());
    }

    private String lookupUserIdForNavIdent(String navIdent) {
        var res = getAppGraphClient()
                .users().buildRequest(List.of(new QueryOption("$filter", "mailNickname eq '" + navIdent + "'")))
                .select("id")
                .get().getCurrentPage();
        if (res.size() != 1) {
            log.info("Did not find single user for navIdent {} ({})", navIdent, res.size());
            return null;
        }
        return res.get(0).id;
    }

    private byte[] lookupUserProfilePicture(String id) {
        try {
            var photo = getAppGraphClient()
                    .users(id)
                    .photo().content()
                    .buildRequest().get();
            return StreamUtils.copyToByteArray(photo);
        } catch (GraphServiceException e) {
            if (GraphLogger.isNotError(e)) {
                return null;
            }
            throw new TechnicalException("error with azure", e);
        } catch (IOException | ClientException e) {
            if (e.getCause() instanceof SocketTimeoutException) {
                throw new TimeoutException("Azure request timed out", e);
            }
            throw new TechnicalException("io error with azure", e);
        }
    }

    private GraphServiceClient<Request> getMailGraphClient() {
        return azureTokenProvider.getGraphClient(azureTokenProvider.getMailAccessToken());
    }

    private GraphServiceClient<Request> getAppGraphClient() {
        return azureTokenProvider.getGraphClient(azureTokenProvider.getApplicationTokenForResource(MICROSOFT_GRAPH_SCOPE_APP));
    }
}
