package no.nav.data.team.resource;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.azure.AzureTokenProvider;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.integration.process.GraphQLRequest;
import no.nav.data.team.resource.dto.NomGraphQlRessurs;
import no.nav.nom.graphql.model.RessursDto;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

import static java.util.Arrays.asList;
import static java.util.stream.Collectors.joining;
import static no.nav.data.common.web.TraceHeaderRequestInterceptor.correlationInterceptor;

@Slf4j
@Service
@RequiredArgsConstructor
public class NomGraphClient {

    private RestTemplate restTemplate;
    private final RestTemplateBuilder restTemplateBuilder;
    private final SecurityProperties securityProperties;
    private final AzureTokenProvider tokenProvider;

    private static final String GET_ORG_FOR_IDENT_QUERY = "nom/graphql/get_org_for_ident.graphql";
    private static final String getOrgQuery = StreamUtils.readCpFile(GET_ORG_FOR_IDENT_QUERY);
    private static final String scopeTemplate = "api://%s-gcp.nom.nom-api/.default";
    private static final String url = "https://nom-api.dev.intern.nav.no/graphql";

    private static final Cache<String, RessursDto> orgCache = MetricUtils.register("nomOrgCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterAccess(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    public RessursDto getDepartment(String navIdent) {
        return orgCache.get(navIdent, k -> {
            var req = new GraphQLRequest(getOrgQuery, Map.of("navIdent", navIdent));

            var res = template().postForEntity(url, req, NomGraphQlRessurs.Single.class);
            return res.getBody().getData().get();
        });
    }

    public Map<String, RessursDto> getDepartments(List<String> navIdents) {
        return orgCache.getAll(navIdents, idents -> {
            var queryBase = asList(getOrgQuery.split("\n"));
            var fragment = queryBase.subList(1, queryBase.size() - 1);

            var queries = StreamSupport.stream(idents.spliterator(), true)
                    .map(ident -> "%s:%s".formatted(ident, String.join(" ", fragment).replace("$navIdent", "\"" + ident + "\"")))
                    .collect(joining("\n"));

            var query = "query getOrgForAllIdents { \n" + queries.replaceAll("\s{2,}", " ") + "\n}";
            System.out.println(query);
            var req = new GraphQLRequest(query);

            var res = template().postForEntity(url, req, NomGraphQlRessurs.Mapped.class);
            return res.getBody().toSingleResultMap();
        });
    }

    private RestOperations template() {
        if (restTemplate == null) {
            restTemplate = restTemplateBuilder
                    .additionalInterceptors(correlationInterceptor(), tokenInterceptor())
                    .rootUri(url)
                    .build();
        }
        return restTemplate;
    }

    @SneakyThrows
    private ClientHttpRequestInterceptor tokenInterceptor() {
        return (request, body, execution) -> {
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProvider.getConsumerToken(getScope()));
            return execution.execute(request, body);
        };
    }

    private String getScope() {
        return scopeTemplate.formatted(securityProperties.isDev() ? "dev" : "prod");
    }
}
