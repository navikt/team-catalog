package no.nav.data.common.mail;

import io.netty.handler.logging.LogLevel;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.transport.logging.AdvancedByteBufFormat;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;

@Component
public class EmailClient {
    public static final Logger logger = LogManager.getLogger(EmailClient.class);

    private final WebClient webClient;
    private final EmailProperties emailProperties;

    public EmailClient(
        OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager,
        EmailProperties emailProperties
    ) {
        this.emailProperties = emailProperties;
        var oAuth2Filter = new ServletOAuth2AuthorizedClientExchangeFilterFunction(oAuth2AuthorizedClientManager);
        oAuth2Filter.setDefaultClientRegistrationId("email");


        this.webClient = WebClient.builder()
            .filter(oAuth2Filter)
                .filters(exchangeFilterFunctions -> {
                    exchangeFilterFunctions.add(logRequest());
                    exchangeFilterFunctions.add(logResponse());
                })
            .baseUrl(emailProperties.baseUrl())
            .build();
    }

    // This method returns filter function which will log request data
    private static ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            logger.info("Request: {} {}", clientRequest.method(), clientRequest.url());
            clientRequest.headers().forEach((name, values) -> values.forEach(value -> logger.info("{}={}", name, value)));
            return Mono.just(clientRequest);
        });
    }

    // This method returns filter function which will log request data
    private static ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(clientResponse -> {
            logger.info("Response: {} {}", clientResponse.statusCode());
            return Mono.just(clientResponse);
        });
    }


    public Mono<Void> sendEmail(MailTask mailTask) {
        if (emailProperties.enabled()) {
            var emailMessage = mapFrom(mailTask);

            return webClient.post()
                .body(Mono.just(emailMessage), EmailMessage.class)
                .retrieve()
                .bodyToMono(Void.class)
                .retryWhen(defaultRetry(emailProperties.maxAttempts(), emailProperties.backoffDurationMillis()))
                .doOnError(WebClientResponseException.class, (WebClientResponseException webClientResponseException) -> {
                    String errorMsg = String.format(
                        "POST %s resulted in status %s with body %s",
                        webClientResponseException.getRequest() != null ? webClientResponseException.getRequest().getURI() : "n/a",
                        webClientResponseException.getStatusCode().value(),
                        webClientResponseException.getResponseBodyAsString()
                    );

                    throw new EmailClientUnforseenException(errorMsg);
                });
        } else {
            logger.info("Email which would have been sent: {}", mailTask);
            return Mono.empty();
        }
    }

    private EmailMessage mapFrom(MailTask mailTask){
        return new EmailMessage(
                mailTask.getSubject(),
                mailTask.getBody(),
                List.of(mailTask.getTo())
        );
    }

    private Retry defaultRetry(Integer maxAttempts, Integer backoffDurationMillis) {
        return Retry.backoff(maxAttempts, Duration.ofMillis(backoffDurationMillis)).jitter(0.75).filter(throwable -> {
            if (throwable instanceof WebClientResponseException) {
                return ((WebClientResponseException) throwable).getStatusCode().is5xxServerError();
            }
            return false;
        }).onRetryExhaustedThrow((retryBackoffSpec, retrySignal) -> {
            Throwable throwable = retrySignal.failure();
            if (throwable instanceof WebClientResponseException) {
                throw (WebClientResponseException) throwable;
            }
            throw new RuntimeException(throwable);
        });
    }

}
