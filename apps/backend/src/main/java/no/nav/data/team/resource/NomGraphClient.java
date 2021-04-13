package no.nav.data.team.resource;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.azure.AzureTokenProvider;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.integration.process.GraphQLRequest;
import no.nav.data.team.resource.dto.NomGraphQlRessurs;
import no.nav.data.team.resource.dto.NomGraphQlRessurs.Single;
import no.nav.data.team.resource.dto.NomGraphQlRessurs.Single.Ressurser;
import no.nav.nom.graphql.model.LederOrganisasjonsenhetDto;
import no.nav.nom.graphql.model.OrganisasjonsenhetDto;
import no.nav.nom.graphql.model.OrganisasjonsenhetsKoblingDto;
import no.nav.nom.graphql.model.RessursDto;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static java.util.Arrays.asList;
import static java.util.Objects.requireNonNull;
import static java.util.stream.Collectors.joining;
import static no.nav.data.common.web.TraceHeaderRequestInterceptor.correlationInterceptor;

/**
 * Cannot be used in dev atm, as teamkat runs as nav.no, and nom as trygdeetaten.no
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NomGraphClient {

    private RestTemplate restTemplate;
    private final RestTemplateBuilder restTemplateBuilder;
    private final SecurityProperties securityProperties;
    private final AzureTokenProvider tokenProvider;

    private static final String GET_ORG_FOR_IDENT_QUERY = "nom/graphql/queries/get_org_for_ident.graphql";
    private static final String GET_LEADER_MEMBERS_FOR_IDENT_QUERY = "nom/graphql/queries/get_personer_for_org.graphql";
    private static final String getOrgQuery = StreamUtils.readCpFile(GET_ORG_FOR_IDENT_QUERY);
    private static final String getLeaderMemberQuery = StreamUtils.readCpFile(GET_LEADER_MEMBERS_FOR_IDENT_QUERY);
    private static final String scopeTemplate = "api://%s-gcp.nom.nom-api/.default";
    private static final String url = "https://nom-api.%sintern.nav.no/graphql";

    private static final Cache<String, RessursDto> orgCache = MetricUtils.register("nomOrgCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterAccess(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    private static final Cache<String, List<String>> leaderCache = MetricUtils.register("nomLeaderCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterAccess(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    public RessursDto getDepartment(String navIdent) {
        return getDepartments(List.of(navIdent)).getOrDefault(navIdent, null);
    }

    public Map<String, RessursDto> getDepartments(List<String> navIdents) {
        if (securityProperties.isDev()) {
            return Map.of();
        }
        return orgCache.getAll(navIdents, idents -> {
            var queryBase = asList(getOrgQuery.split("\n"));
            var ressursQ = queryBase.get(1);
            var fragment = String.join(" ", queryBase.subList(3, queryBase.size())).replaceAll("\s{2,}", " ");

            var queries = StreamSupport.stream(idents.spliterator(), true)
                    .map(ident -> "%s:%s".formatted(ident, ressursQ.trim().replace("$navIdent", "\"" + ident + "\"")))
                    .collect(joining("\n"));

            var query = "query getOrgForAllIdents { \n" + queries + "\n}\n" + fragment;
            log.debug(query);
            var req = new GraphQLRequest(query);

            var res = template().postForEntity(getUri(), req, NomGraphQlRessurs.Mapped.class);
            logErrors("getDepartments", Optional.ofNullable(res.getBody()).map(NomGraphQlRessurs.Mapped::getErrors));
            return requireNonNull(res.getBody()).toSingleResultMap();
        });
    }

    public List<String> getLeaderMembers(String navIdent) {
        if (securityProperties.isDev()) {
            return List.of();
        }
        return leaderCache.get(navIdent, ident -> {
            var req = new GraphQLRequest(getLeaderMemberQuery, Map.of("navIdent", navIdent));
            log.debug(getLeaderMemberQuery);
            var res = template().postForEntity(getUri(), req, NomGraphQlRessurs.Single.class);
            logErrors("getLeaderMembers", Optional.ofNullable(res.getBody()).map(NomGraphQlRessurs.Single::getErrors));
            return Optional.ofNullable(res.getBody())
                    .map(Single::getData)
                    .map(Ressurser::getRessurs)
                    .stream()
                    .flatMap(Collection::stream)
                    .map(RessursDto::getLederFor)
                    .flatMap(Collection::stream)
                    .map(LederOrganisasjonsenhetDto::getOrganisasjonsenhet)
                    .filter(org -> DateUtil.isNow(org.getGyldigFom(), org.getGyldigTom()))
                    .map(OrganisasjonsenhetDto::getKoblinger)
                    .flatMap(Collection::stream)
                    .map(OrganisasjonsenhetsKoblingDto::getRessurs)
                    .map(RessursDto::getNavIdent)
                    .collect(Collectors.toList());
        });
    }

    public void logErrors(String query, Optional<ArrayNode> errors) {
        errors.ifPresent(errorArray -> log.error("Error during graphql query {} {}", query, JsonUtils.toJson(errorArray)));
    }

    private RestOperations template() {
        if (restTemplate == null) {
            restTemplate = restTemplateBuilder
                    .additionalInterceptors(correlationInterceptor(), tokenInterceptor())
                    .messageConverters(new MappingJackson2HttpMessageConverter())
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

    private String getUri() {
        return securityProperties.isDev() ? url.formatted("dev.") : url.formatted("");
    }

    private String getScope() {
        return scopeTemplate.formatted(securityProperties.isDev() ? "dev" : "prod");
    }
}
