package no.nav.data.team.resource;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.TokenProvider;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.integration.process.GraphQLRequest;
import no.nav.data.team.org.OrgUrlId;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiRessurs;
import no.nav.data.team.resource.dto.NomGraphQlResponse.SingleOrg;
import no.nav.data.team.resource.dto.NomGraphQlResponse.SingleRessurs;
import no.nav.data.team.resource.dto.NomGraphQlResponse.SingleRessurs.DataWrapper;
import no.nav.data.team.resource.dto.ResourceUnitsResponse;
import no.nav.nom.graphql.model.*;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Method;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.UUID;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.StreamUtils.distinctByKey;
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
    private final TokenProvider tokenProvider;
    private final NomGraphQLProperties properties;

    private static final String getResourceQuery = StreamUtils.readCpFile("nom/graphql/queries/get_org_for_ident.graphql");
    private static final String getOrgQuery = StreamUtils.readCpFile("nom/graphql/queries/get_org_with_organiseringer.graphql");
    private static final String getLeaderMemberQuery = StreamUtils.readCpFile("nom/graphql/queries/get_personer_for_org.graphql");
    private static final String scopeTemplate = "api://%s-gcp.nom.nom-api/.default";

    private static final Cache<String, RessursDto> ressursCache = MetricUtils.register("nomRessursCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    private static final Cache<String, OrgEnhetDto> orgCache = MetricUtils.register("nomOrgCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    private static final Cache<String, List<String>> leaderCache = MetricUtils.register("nomLeaderCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    public Optional<RessursDto> getRessurs(String navIdent) {
        return Optional.ofNullable(getRessurser(List.of(navIdent)).get(navIdent));
    }

    public Optional<OrgEnhetDto> getOrgEnhet(String orgUrl) {
        var org = orgCache.get(orgUrl, key -> {
            var orgUrlData = new OrgUrlId(orgUrl);
            Map<String,Object> orgMap = Map.of("agressoId",orgUrlData.getAgressoId(), "orgNiv", orgUrlData.getOrgNiv());

            var req = new GraphQLRequest(getOrgQuery, orgMap);

            var res = template().postForEntity(properties.getUrl(), req, SingleOrg.class);
            logErrors("getOrgWithOrganiseringer", res.getBody());
            var orgEnhet = requireNonNull(res.getBody()).getData().getOrgEnhet();
            if (orgEnhet != null) {
                orgEnhet.setOrganiseringer(distinctByKey(orgEnhet.getOrganiseringer(), o -> o.getOrgEnhet().getAgressoId()));
            }
            return orgEnhet;
        });
        return Optional.ofNullable(org);
    }

    public Optional<ResourceUnitsResponse> getUnits(String navIdent) {
        return getRessurs(navIdent)
                .map(r -> ResourceUnitsResponse.from(r, getLeaderMembers(navIdent), this::getOrgEnhet));
    }

    private Map<String, RessursDto> getRessurser(List<String> navIdents) {
        return ressursCache.getAll(navIdents, idents -> {
            var req = new GraphQLRequest(getResourceQuery, Map.of("navIdenter", idents));
            var res = template().postForEntity(properties.getUrl(), req, MultiRessurs.class);
            logErrors("getDepartments", res.getBody());
            return requireNonNull(res.getBody()).getData().getRessurserAsMap();
        });
    }

    public List<String> getLeaderMembers(String navIdent) {
        return leaderCache.get(navIdent, ident -> {
            var req = new GraphQLRequest(getLeaderMemberQuery, Map.of("navIdent", navIdent));
            var res = template().postForEntity(properties.getUrl(), req, SingleRessurs.class);
            logErrors("getLeaderMembers", res.getBody());
            var orgenheter = Optional.ofNullable(res.getBody())
                    .map(SingleRessurs::getData)
                    .map(DataWrapper::getRessurs)
                    .stream()
                    .map(RessursDto::getLederFor)
                    .flatMap(Collection::stream)
                    .map(LederOrgEnhetDto::getOrgEnhet)
                    .filter(org -> DateUtil.isNow(org.getGyldigFom(), org.getGyldigTom())).toList();

            var directMembers = orgenheter
                    .stream()
                    .map(OrgEnhetDto::getKoblinger)
                    .flatMap(Collection::stream)
                    .map(OrgEnhetsKoblingDto::getRessurs)
                    .map(RessursDto::getNavident)
                    .filter(Objects::nonNull)
                    .filter(id -> !id.equals(navIdent));

            var subDepMembers = orgenheter.stream()
                    .map(OrgEnhetDto::getOrganiseringer)
                    .flatMap(Collection::stream)
                    .map(OrganiseringDto::getOrgEnhet)
                    .map(OrgEnhetDto::getLeder)
                    .flatMap(Collection::stream)
                    .map(OrgEnhetsLederDto::getRessurs)
                    .map(RessursDto::getNavident)
                    .filter(Objects::nonNull)
                    .filter(id -> !id.equals(navIdent));

            var dm = directMembers.toList();
            var sdm = subDepMembers.toList();

            var x = UUID.randomUUID();
            log.debug("{}: getLeaderMembers for {}: orgenheter size {}, directMembers size {}, subDepartmentMembers size {}",x, navIdent, orgenheter.size(), dm.size(), sdm.size());
            log.debug("{}\n{}",x,res.getBody().toString());
            return Stream.concat(dm.stream(), sdm.stream())
                    .distinct()
                    .toList();
        });
    }

    @SneakyThrows
    public void logErrors(String query, @Nullable Object body) {
        if (body == null) {
            return;
        }
        Method getErrors = requireNonNull(ReflectionUtils.findMethod(body.getClass(), "getErrors"));
        var errors = Optional.ofNullable((ArrayNode) getErrors.invoke(body));
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
            String token = tokenProvider.getConsumerToken(getScope());
            log.debug("tokenInterceptor adding token: %s... for scope '%s'".formatted( (token != null && token.length() > 12 ? token.substring(0,11) : token ), getScope()));
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, token);
            return execution.execute(request, body);
        };
    }

    private String getScope() {
        return scopeTemplate.formatted(securityProperties.isDev() ? "dev" : "prod");
    }
}
