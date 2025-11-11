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
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiOrg;
import no.nav.data.team.resource.dto.NomGraphQlResponse.MultiRessurs;
import no.nav.data.team.resource.dto.NomGraphQlResponse.SingleOrg;
import no.nav.data.team.resource.dto.NomGraphQlResponse.SingleRessurs;
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
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Stream;

import static java.util.Objects.*;
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
    private static final String getOrgByLeaderNavidentQuery = StreamUtils.readCpFile("nom/graphql/queries/get_org_by_leader_navident.graphql");
    private static final String getUnderOrganiseringIdsQuery = StreamUtils.readCpFile("nom/graphql/queries/get_under_organiseringer_ids.graphql");
    private static final String getKoblingByNomIdQuery = StreamUtils.readCpFile("nom/graphql/queries/get_koblinger_by_nomid.graphql");
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

    private static final Cache<String, List<String>> leaderCacheV2 = MetricUtils.register("nomLeaderCacheV2",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

    private static final Cache<String, List<String>> underOrganiseringerIdCache = MetricUtils.register("underOrganiseringerIdCache",
            Caffeine.newBuilder().recordStats()
                    .expireAfterWrite(Duration.ofMinutes(10))
                    .maximumSize(1000).build());

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
                var ressurser = org.getOrgTilknytninger().stream().map(OrgTilknytningDto::getRessurs);
                var okRessurser = ressurser.filter(it -> !it.getNavident().equals(navIdent) && this.ressursHarEnRelevantOrgtilknytning(it, refId));
                directMembers.addAll(okRessurser.map(RessursDto::getNavident).filter(Objects::nonNull).toList());
            }

            var subDepMembers = orgenheter.stream()
                    .map(OrgEnhetDto::getOrganiseringer)
                    .flatMap(Collection::stream)
                    .map(OrganiseringDto::getOrgEnhet)
                    .map(OrgEnhetDto::getLedere)
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

    public Optional<ResourceUnitsResponse> getLeaderMembersActiveOnlyV2(String navident) {
        var nomClient = NomClient.getInstance();

        var orgEnhetIder = getOrgEnhetIdsByLeaderByNavident(navident);
        log.info("getOrgEnhetIdsByLeaderByNavident {} for navident {}", orgEnhetIder, navident);
        var resources = getNavidenterByOrgEnhetIder(orgEnhetIder).stream()
                .filter(ident -> !ident.equals(navident))
                .map(nomClient::getByNavIdent)
                .filter(Optional::isPresent).map(Optional::get)
                .filter(it -> !it.isInactive()).map(Resource::getNavIdent).toList();

        return getRessurs(navident).map(r -> ResourceUnitsResponse.from(r, resources, this::getOrgEnhet));
    }

    private List<String> getOrgEnhetIdsByLeaderByNavident(String navident) {
        return leaderCacheV2.get(navident, ident -> {
            var req = new GraphQLRequest(getOrgByLeaderNavidentQuery, Map.of("navident", navident));
            var res = template().postForEntity(properties.getUrl(), req, SingleRessurs.class);
            logErrors("getOrgEnhetIdByLeaderByNavident", res.getBody());
            return requireNonNull(res.getBody()).getData().getRessurs().getLederFor().stream()
                    .map(LederOrgEnhetDto::getOrgEnhet)
                    .filter(orgEnhetDto -> !Objects.equals(orgEnhetDto.getNomNivaa(), NomNivaaDto.DRIFTSENHET)
                        && !Objects.equals(orgEnhetDto.getNomNivaa(), NomNivaaDto.LINJEENHET))
                    .map(OrgEnhetDto::getId)
                    .filter(nomId -> !nomId.equals(getNAV()))
                    .toList();
        });
    }

    private List<String> getNavidenterByOrgEnhetIder(List<String> orgEnhetIder) {
        Set<String> ider = new HashSet<>();
        orgEnhetIder.forEach(id -> {
            ider.add(id);
            getUnderOrgEnheter(id, ider);
        });
        return getKoblingerByNomIder(new ArrayList<>(ider));
    }

    private void getUnderOrgEnheter(String orgEnhetId, Set<String> ider) {
        List<String> listOfUnderIds = underOrganiseringerIdCache.get(orgEnhetId, this::fetchUnderOrganiseringIds);

        if (nonNull(listOfUnderIds) && !listOfUnderIds.isEmpty()) {
            ider.addAll(listOfUnderIds);
            listOfUnderIds.forEach(listOfUnderId -> getUnderOrgEnheter(listOfUnderId, ider));
        }
    }

    private List<String> fetchUnderOrganiseringIds(String orgEnhetId) {
        var req = new GraphQLRequest(getUnderOrganiseringIdsQuery, Map.of("nomId", orgEnhetId));
        var res = template().postForEntity(properties.getUrl(), req, SingleOrg.class);
        logErrors("getUnderOrgEnheter", res.getBody());

        return isNull(res.getBody()) ? new ArrayList<>() :
                res.getBody()
                        .getData()
                        .getOrgEnhet()
                        .getOrganiseringer()
                        .stream()
                        .map(OrganiseringDto::getOrgEnhet)
                        .map(OrgEnhetDto::getId)
                        .toList();
    }

    private List<String> getKoblingerByNomIder(List<String> nomIder) {
        var req = new GraphQLRequest(getKoblingByNomIdQuery, Map.of("nomIder", nomIder));
        var res = template().postForEntity(properties.getUrl(), req, MultiOrg.class);
        logErrors("getKoblingerByNomIder", res.getBody());
        return isNull(res.getBody()) ? new ArrayList<>() :
                res.getBody()
                        .getData()
                        .getOrgEnheter().stream()
                        .map(MultiOrg.DataWrapper.OrgEnhetWrapper::getOrgEnhet)
                        .map(OrgEnhetDto::getOrgTilknytninger)
                        .flatMap(Collection::stream)
                        .map(OrgTilknytningDto::getRessurs)
                        .map(RessursDto::getNavident)
                        .distinct()
                        .toList();
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

    private boolean ressursHarEnRelevantOrgtilknytning(RessursDto ressursDto, String akseptertOrgenhetId){
        var out = false;
        for(var orgTilknytning : ressursDto.getOrgTilknytninger()){
            var idErRelevant = orgTilknytning.getOrgEnhet().getId().equals(akseptertOrgenhetId);
            if(idErRelevant && orgTilknytning.getErDagligOppfolging()){
                var intervallOkBefore = orgTilknytning.getGyldigFom().isBefore(LocalDate.now().plusDays(1));
                var intervallOkAfter = (orgTilknytning.getGyldigTom() == null || LocalDate.now().minusDays(1).isBefore(orgTilknytning.getGyldigTom()));
                out |= intervallOkBefore && intervallOkAfter;
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

    private String getNAV() {
        return getScope().contains("dev") ? "sa312u" : "py437s";
    }
}
