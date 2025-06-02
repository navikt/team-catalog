package no.nav.data.team.resource;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.azure.AzureTokenProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
public class NomAzurePictureService {



    private AzureTokenProvider tokenProvider;
    private SecurityProperties securityProperties;
    private RestClient restClient;


    public NomAzurePictureService(AzureTokenProvider tokenProvider, SecurityProperties securityProperties) {
        this.tokenProvider = tokenProvider;
        this.securityProperties = securityProperties;
        this.restClient = RestClient.builder()
                .baseUrl("http://nom-azure.org.svc.cluster.local")
                .requestInterceptor(tokenInterceptor())
                .build();
    }

    public Optional<byte[]> getPhoto(String id, boolean forceUpdate) {
        if (forceUpdate) {
            this.restClient.get().uri("/picture," + id + "/refresh");
            // todo, verify that photo returned later is indeed refreshed
        }
        log.debug("Getting picture from nom-azure for navident {}", id);
        var responseEntity = this.restClient.get().uri("/picture/," + id).retrieve().toEntity(byte[].class);
        log.debug("Retrieved response from nom-azure for navident {}", id);
        if(responseEntity.getStatusCode().is2xxSuccessful()){
            log.debug("Retrieved OK status code from nom-azure for navident {}", id);
            return Optional.ofNullable(responseEntity.getBody());
        }
        if(responseEntity.getStatusCode().value() == HttpStatus.NOT_FOUND.value()){
            log.debug("Retrieved NOT_FOUND status code from nom-azure for navident {}", id);
            return Optional.empty();
        }
        log.error("Getting photo from nom-azure failed with status code {}", responseEntity.getStatusCode());
        return Optional.empty();
    }



    @SneakyThrows
    private ClientHttpRequestInterceptor tokenInterceptor() {
        final String scopeTemplate = "api://%s-gcp.org.nom-azure/.default";
        var nomAzureScope = scopeTemplate.formatted(securityProperties.isDev() ? "dev" : "prod");

        return (request, body, execution) -> {
            String token = tokenProvider.getConsumerToken(nomAzureScope);
            log.debug("tokenInterceptor adding token: %s... for scope '%s'".formatted( (token != null && token.length() > 12 ? token.substring(0,11) : token ), nomAzureScope));
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, token);
            return execution.execute(request, body);
        };
    }
}
