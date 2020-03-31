package no.nav.data.team.naisteam.nora;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.team.common.utils.MetricUtils;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.naisteam.domain.NaisTeam;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Arrays.asList;
import static java.util.Comparator.comparing;
import static java.util.Objects.requireNonNull;
import static no.nav.data.team.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.safeStream;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Service
@ConditionalOnProperty("client.team-nora.enable")
public class NoraClient implements NaisTeamService {

    private final RestTemplate restTemplate;
    private final NoraProperties noraProperties;
    private final LoadingCache<String, List<NoraTeam>> allTeamsCache;
    private final LoadingCache<String, NoraTeam> teamCache;
    private final LoadingCache<String, List<NoraApp>> appsCache;

    public NoraClient(RestTemplate restTemplate, NoraProperties noraProperties) {
        this.restTemplate = restTemplate;
        this.noraProperties = noraProperties;

        this.allTeamsCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(1).build(k -> getTeamsResponse());
        this.teamCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(100).build(this::getTeamResponse);
        this.appsCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(100).build(this::getAppsResponse);
        MetricUtils.register("noraAllTeamsCache", allTeamsCache);
        MetricUtils.register("noraTeamCache", teamCache);
        MetricUtils.register("noraAppsCache", appsCache);
    }

    @Override
    public List<NaisTeam> getAllTeams() {
        return getTeams();
    }

    @Override
    public Optional<NaisTeam> getTeam(String teamId) {
        NoraTeam noraTeam = teamCache.get(teamId);
        if (noraTeam == null) {
            return Optional.empty();
        }
        NaisTeam team = noraTeam.convertToTeam();
        team.setNaisApps(convert(appsCache.get(teamId), NoraApp::convertToApp));
        return Optional.of(team);
    }

    @Override
    public boolean teamExists(String teamId) {
        return getTeams().stream().anyMatch(team -> team.getId().equals(teamId));
    }

    @Override
    public List<NaisTeam> search(String name) {
        var teams = StreamUtils.filter(getAllTeams(), team -> containsIgnoreCase(team.getName(), name));
        teams.sort(comparing(NaisTeam::getName, startsWith(name)));
        return teams;
    }

    private List<NaisTeam> getTeams() {
        List<NoraTeam> noraApps = allTeamsCache.get("singleton");
        return safeStream(noraApps).map(NoraTeam::convertToTeam).distinct()
                .filter(team -> StringUtils.isNotBlank(team.getId()))
                .sorted(Comparator.comparing(NaisTeam::getName)).collect(Collectors.toList());
    }

    private List<NoraTeam> getTeamsResponse() {
        ResponseEntity<NoraTeam[]> response = restTemplate.getForEntity(noraProperties.getTeamsUrl(), NoraTeam[].class);
        Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to nora failed " + response.getStatusCode());
        return response.hasBody() ? asList(requireNonNull(response.getBody())) : List.of();
    }

    private NoraTeam getTeamResponse(String nick) {
        ResponseEntity<NoraTeam> response = restTemplate.getForEntity(noraProperties.getTeamUrl(), NoraTeam.class, nick);
        Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to nora failed for team " + nick + " " + response.getStatusCode());
        return response.hasBody() ? requireNonNull(response.getBody()) : null;
    }

    private List<NoraApp> getAppsResponse(String nick) {
        ResponseEntity<NoraApp[]> response = restTemplate.getForEntity(noraProperties.getAppsUrl(), NoraApp[].class, nick);
        Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to nora failed for team " + nick + " " + response.getStatusCode());
        return response.hasBody() ? asList(requireNonNull(response.getBody())) : List.of();
    }

}
