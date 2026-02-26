package no.nav.data.team.resource;

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
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiOrg;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiRessurs;
import no.nav.data.team.resource.dto.NomGraphQlResponse.SingleOrg;
import no.nav.data.team.resource.dto.NomGraphQlResponse.SingleRessurs;
import no.nav.data.team.resource.dto.ResourceUnitsResponse;
import no.nav.nom.graphql.model.*;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.lang.reflect.Method;
import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Objects.isNull;
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
    private static final String getOrgOverQuery = StreamUtils.readCpFile("nom/graphql/queries/get_org_with_organisering_over.graphql");
    private static final String getOrgWithNameAndLeaderQuery = StreamUtils.readCpFile("nom/graphql/queries/get_org_with_leder.graphql");
    private static final String getOrgEnheterWithLederOrganiseringUnder = StreamUtils.readCpFile("nom/graphql/queries/get_org_with_leder_organisering_under.graphql");
    private static final String getHeleHierarkietTilLederOgOrgtilknytningerQuery = StreamUtils.readCpFile("nom/graphql/queries/get_hele_hierarkiet_til_leder_og_orgtilknytninger.graphql");
    private static final String searchForRessurs = StreamUtils.readCpFile("nom/graphql/queries/search_ressurs.graphql");
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

    private static final Cache<String, OrgEnhetDto> orgOverCache = MetricUtils.register("nomOrgOverCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    private static final Cache<String, OrgEnhetDto> orgUnderWithLeaderCache = MetricUtils.register("nomOrgUnderWithLeaderCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    private static final Cache<String, List<String>> leaderHeleHierarkietOgAnsatteCache = MetricUtils.register("leaderHeleHierarkietOgAnsatteCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(30))
                    .maximumSize(2000).build());

    public Optional<RessursDto> getRessurs(String navIdent) {
        return Optional.ofNullable(getRessurser(List.of(navIdent)).get(navIdent));
    }

    public Optional<OrgEnhetDto> getOrgenhetMedOverOrganisering(String nomId) {
        return Optional.ofNullable(getOrgWithOrganiseringOver(nomId).get(nomId));
    }

    public Optional<OrgEnhetDto> getOrgEnhet(String nomId) {
        var org = orgCache.get(nomId, key -> {
            var req = new GraphQLRequest(getOrgQuery, Map.of("nomId", nomId));

            var res = template().postForEntity(properties.getUrl(), req, SingleOrg.class);
            logErrors("getOrgWithOrganiseringer", res.getBody());
            var orgEnhet = requireNonNull(res.getBody()).getData().getOrgEnhet();
            if (orgEnhet != null) {
                orgEnhet.setOrganiseringer(distinctByKey(orgEnhet.getOrganiseringer(), o -> o.getOrgEnhet().getId()));
            }
            return orgEnhet;
        });
        return Optional.ofNullable(org);
    }

    public List<OrgEnhetDto> getOrgEnheter(List<String> orgIds) {
        var req = new GraphQLRequest(getOrgWithNameAndLeaderQuery, Map.of("ids", orgIds));
        var res = template().postForEntity(properties.getUrl(), req, MultiOrg.class);
        logErrors("getOrgEnheter", res.getBody());
        return requireNonNull(res.getBody()).getData().getOrgEnheter().stream()
                .map(MultiOrg.DataWrapper.OrgEnhetWrapper::getOrgEnhet)
                .toList();
    }

    public Optional<ResourceUnitsResponse> getUnits(String navIdent) {
        return getRessurs(navIdent)
                .map(r -> ResourceUnitsResponse.from(r, getLeaderMembersActiveOnly(navIdent), this::getOrgEnhet));
    }

    public Map<String, RessursDto> getRessurser(List<String> navIdents) {
        return ressursCache.getAll(navIdents, idents -> {
            var req = new GraphQLRequest(getResourceQuery, Map.of("navIdenter", idents));
            var res = template().postForEntity(properties.getUrl(), req, MultiRessurs.class);
            logErrors("getDepartments", res.getBody());
            return requireNonNull(res.getBody()).getData().getRessurserAsMap();
        });
    }

    public Map<String, OrgEnhetDto> getOrgWithOrganiseringOver(String nomId) {
        return orgOverCache.getAll(Collections.singleton(nomId), id -> {
            var req = new GraphQLRequest(getOrgOverQuery, Map.of("nomId", nomId));
            var res = template().postForEntity(properties.getUrl(), req, SingleOrg.class);
            logErrors("getOrgOver", res.getBody());
            return Map.of(requireNonNull(res.getBody()).getData().getOrgEnhet().getId(), res.getBody().getData().getOrgEnhet());
        });
    }

    public OrgEnhetDto getOrgEnhetMedUnderOrganiseringOgLedere(String nomId) {
        return orgUnderWithLeaderCache.get(nomId, id -> {
            var req = new GraphQLRequest(getOrgEnheterWithLederOrganiseringUnder, Map.of("id", nomId));
            var res = template().postForEntity(properties.getUrl(), req, SingleOrg.class);
            logErrors("getOrgEnheterWithLederOrganiseringUnder", res.getBody());
            return requireNonNull(res.getBody()).getData().getOrgEnhet();
        });
    }

    public List<String> getLeaderMembersActiveOnly(String navIdent) {
        var nomClient = NomClient.getInstance();
        return getLeaderMembers(navIdent).stream()
                .map(nomClient::getByNavIdent)
                .filter(Optional::isPresent).map(Optional::get)
                .filter(it -> !it.isInactive()).map(Resource::getNavIdent).toList();
    }

    public List<String> getLeaderMembers(String navIdent) {
        return leaderCache.get(navIdent, ident -> {
            var req = new GraphQLRequest(getLeaderMemberQuery, Map.of("navident", navIdent));
            var res = template().postForEntity(properties.getUrl(), req, SingleRessurs.class);
            logErrors("getLeaderMembers", res.getBody());
            var orgenheter = Optional.ofNullable(res.getBody())
                    .map(SingleRessurs::getData)
                    .map(SingleRessurs.DataWrapper::getRessurs)
                    .stream()
                    .map(RessursDto::getLederFor)
                    .flatMap(Collection::stream)
                    .map(LederOrgEnhetDto::getOrgEnhet)
                    .filter(org -> DateUtil.isNow(org.getGyldigFom(), org.getGyldigTom())).toList();

            var directMembers = new ArrayList<String>();
            for (var org : orgenheter) {
                var refId = org.getId();
                var ressurser = org.getKoblinger().stream().map(OrgEnhetsKoblingDto::getRessurs);
                var okRessurser = ressurser.filter(it -> !it.getNavident().equals(navIdent) && this.ressursHarEnRelevantOrgtilknytning(it, refId));
                directMembers.addAll(okRessurser.map(RessursDto::getNavident).filter(Objects::nonNull).toList());
            }

            var subDepMembers = orgenheter.stream()
                    .map(OrgEnhetDto::getOrganiseringer)
                    .flatMap(Collection::stream)
                    .map(OrganiseringDto::getOrgEnhet)
                    .map(OrgEnhetDto::getLeder)
                    .flatMap(Collection::stream)
                    .map(OrgEnhetsLederDto::getRessurs)
                    .map(RessursDto::getNavident)
                    .filter(Objects::nonNull)
                    .filter(id -> !id.equals(navIdent))
                    .toList();


            var x = UUID.randomUUID();
            log.debug("{}: getLeaderMembers for {}: orgenheter size {}, directMembers size {}, subDepartmentMembers size {}",x, navIdent, orgenheter.size(), directMembers.size(), subDepMembers);
            log.debug("{}\n{}",x,res.getBody().toString());
            return Stream.concat(directMembers.stream(), subDepMembers.stream())
                    .distinct()
                    .toList();
        });
    }

    public Optional<ResourceUnitsResponse> getLeaderMembersActiveOnlyV2(String navident, boolean includeMembers) {
        var nomClient = NomClient.getInstance();
        List<String> resources = includeMembers ? getNavidenterUnderLeaderByLeaderByNavident(navident).stream()
                .filter(ident -> !ident.equals(navident))
                .map(nomClient::getByNavIdent)
                .filter(Optional::isPresent).map(Optional::get)
                .filter(it -> !it.isInactive()).map(Resource::getNavIdent).toList()
                : Collections.emptyList();
        return getRessurs(navident).map(r -> ResourceUnitsResponse.from(r, resources, this::getOrgEnhet));
    }

    private List<String> getNavidenterUnderLeaderByLeaderByNavident(String navident) {
        return leaderHeleHierarkietOgAnsatteCache.get(navident, ident -> {
            Set<String> navidenter = new HashSet<>();
            var req = new GraphQLRequest(getHeleHierarkietTilLederOgOrgtilknytningerQuery, Map.of("navident", ident));
            var res = template().postForEntity(properties.getUrl(), req, SingleRessurs.class);
            logErrors("getOrgEnhetIdByLeaderByNavident", res.getBody());
            var lederForList = requireNonNull(res.getBody()).getData().getRessurs().getLederFor();
            log.info("getOrgEnhetIdByLeaderByNavident {}", lederForList);
            var orgEnheterLederFor = lederForList.stream()
                    .map(LederOrgEnhetDto::getOrgEnhet)
                    .toList();
            orgEnheterLederFor.forEach(orgEnhetDto -> findNavidenter(orgEnhetDto, navidenter));
            return new ArrayList<>(navidenter);
        });
    }

    private void findNavidenter(OrgEnhetDto orgEnhet, Set<String> navidenter) {
        List<OrgEnhetDto> underOrgEnheter = isNull(orgEnhet.getOrganiseringer()) ? Collections.emptyList()
                : orgEnhet.getOrganiseringer().stream()
                .map(OrganiseringDto::getOrgEnhet)
                .filter(Objects::nonNull)
                .toList();

        if (!underOrgEnheter.isEmpty()) {
            underOrgEnheter.forEach(orgEnhetDto -> findNavidenter(orgEnhetDto, navidenter));
            var navidentUnderheter = underOrgEnheter.stream()
                    .map(OrgEnhetDto::getOrgTilknytninger)
                    .flatMap(Collection::stream)
                    .map(OrgTilknytningDto::getRessurs)
                    .map(RessursDto::getNavident)
                    .collect(Collectors.toSet());

            navidenter.addAll(navidentUnderheter);
        } else {
            navidenter.addAll(
                    orgEnhet.getOrgTilknytninger().stream()
                            .map(OrgTilknytningDto::getRessurs)
                            .map(RessursDto::getNavident)
                            .collect(Collectors.toSet())
            );
        }
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
                    .messageConverters(new JacksonJsonHttpMessageConverter())
                    .build();
        }
        return restTemplate;
    }

    private boolean ressursHarEnRelevantOrgtilknytning(RessursDto ressursDto, String akseptertOrgenhetId){
        var out = false;
        if (ressursDto.getOrgTilknytninger() != null) {
            for (var orgTilknytning : ressursDto.getOrgTilknytninger()) {
                var idErRelevant = orgTilknytning.getOrgEnhet().getId().equals(akseptertOrgenhetId);
                if (idErRelevant && orgTilknytning.getErDagligOppfolging()) {
                    var intervallOkBefore = orgTilknytning.getGyldigFom().isBefore(LocalDate.now().plusDays(1));
                    var intervallOkAfter = (orgTilknytning.getGyldigTom() == null || LocalDate.now().minusDays(1).isBefore(orgTilknytning.getGyldigTom()));
                    out |= intervallOkBefore && intervallOkAfter;
                }
            }
        }
        return out;
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

    public List<String> searchForNavidentByName(String name) {
        var req = new GraphQLRequest(searchForRessurs, Map.of("term", name));
        var resJsonList = template().postForEntity(properties.getUrl(), req, ObjectNode.class);
        var body = resJsonList.getBody();

        { // check for errors
            var hasHttpError = !resJsonList.getStatusCode().is2xxSuccessful();
            if(hasHttpError){
                throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed searchForNavidentByName via nom-graphql");
            }
            var maybeGraphQlErrors = body == null ? null : body.get("errors");
            var hasGraphQlError = maybeGraphQlErrors != null && !maybeGraphQlErrors.isEmpty();
            if (hasGraphQlError) {
                throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed searchForNavidentByName via nom-graphql");
            }
        }
        if(body == null){
            return List.of();
        }
        var data = Optional.ofNullable(body.get("data")).map(dataNode -> dataNode.get("searchRessurs")).orElse(null);
        if(data == null){
            return List.of();
        }
        return data.valueStream().map(it -> Optional.ofNullable(it.get("navident")).map(JsonNode::asText)).filter(Optional::isPresent).map(Optional::get).toList();
    }
}
