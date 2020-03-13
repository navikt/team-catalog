package no.nav.data.team.naisteam.nora;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.team.common.utils.MetricUtils;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.naisteam.domain.NaisTeam;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Objects.requireNonNull;
import static no.nav.data.team.common.utils.StreamUtils.safeStream;

@Service
@ConditionalOnProperty("client.team-nora.enable")
public class NoraClient implements NaisTeamService {

    private final RestTemplate restTemplate;
    private final NoraProperties noraProperties;
    private final LoadingCache<String, List<NoraTeam>> allTeamsCache;
    private final LoadingCache<String, NoraTeam> teamCache;

    public NoraClient(RestTemplate restTemplate, NoraProperties noraProperties) {
        this.restTemplate = restTemplate;
        this.noraProperties = noraProperties;

        this.allTeamsCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(1).build(k -> getTeamsResponse());
        this.teamCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(10))
                .maximumSize(100).build(this::getTeamResponse);
        MetricUtils.register("noraAllTeamsCache", allTeamsCache);
        MetricUtils.register("noraTeamCache", teamCache);
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
        return Optional.of(noraTeam.convertToTeam());
    }

    @Override
    public boolean teamExists(String teamId) {
        return getTeams().stream().anyMatch(team -> team.getId().equals(teamId));
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
        return response.hasBody() ? Arrays.asList(requireNonNull(response.getBody())) : List.of();
    }

    private NoraTeam getTeamResponse(String nick) {
        ResponseEntity<NoraTeam> response = restTemplate.getForEntity(noraProperties.getTeamUrl(), NoraTeam.class, nick);
        Assert.isTrue(response.getStatusCode().is2xxSuccessful() && response.hasBody(), "Call to nora failed for team " + nick + " " + response.getStatusCode());
        return response.hasBody() ? requireNonNull(response.getBody()) : null;
    }

}
