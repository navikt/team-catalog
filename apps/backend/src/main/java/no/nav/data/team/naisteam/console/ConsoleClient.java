package no.nav.data.team.naisteam.console;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.naisteam.domain.NaisTeam;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.graphql.client.GraphQlClient;
import org.springframework.graphql.client.HttpGraphQlClient;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

import static java.time.temporal.ChronoUnit.MINUTES;
import static java.util.Collections.singletonList;
import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Service
@ConditionalOnProperty("client.nais.console.enabled")
@EnableConfigurationProperties(NaisConsoleProperties.class)
public class ConsoleClient implements NaisTeamService {

    private final GraphQlClient client;

    private final LoadingCache<String, List<ConsoleTeam>> allTeamsCache;
    private final LoadingCache<String, ConsoleTeam> teamCache;

    public ConsoleClient(WebClient.Builder builder, NaisConsoleProperties consoleProperties) {
        client = HttpGraphQlClient.builder(builder)
                .webClient(client -> {
                    client.baseUrl(consoleProperties.baseUrl());
                    client.defaultHeaders(headers -> {
                        headers.put(HttpHeaders.AUTHORIZATION, singletonList(consoleProperties.auth().token()));
                        headers.put(HttpHeaders.CONTENT_TYPE, singletonList("application/json"));

                    });
                })
                .build();

        this.allTeamsCache = Caffeine.newBuilder().recordStats()
                .expireAfterWrite(Duration.of(10, MINUTES))
                .maximumSize(1)
                .build(k -> getAllTeamsFromConsole());

        this.teamCache = Caffeine.newBuilder()
                .recordStats()
                .expireAfterWrite(Duration.of(10, MINUTES))
                .maximumSize(100)
                .build(this::getSingleTeamFromConsole);

        MetricUtils.register("NaisConsoleTeamsCache", allTeamsCache);
        MetricUtils.register("NaisConsoleTeamCache", teamCache);
    }

    @Override
    public List<NaisTeam> getAllTeams() {
        List<ConsoleTeam> consoleTeams = allTeamsCache.get("singleton");
        return safeStream(consoleTeams).map(ConsoleTeam::toNaisTeam)
                .distinct()
                .filter(team -> StringUtils.isNotBlank(team.getId()))
                .sorted(comparing(NaisTeam::getName))
                .toList();
    }

    @Override
    public Optional<NaisTeam> getTeam(String teamId) {
        return Optional.ofNullable(teamCache.get(teamId)).map(ConsoleTeam::toNaisTeam);
    }

    @Override
    public boolean teamExists(String teamId) {
        return getAllTeams().stream().anyMatch(team -> team.getId().equals(teamId));
    }

    @Override
    public List<NaisTeam> search(String name) {
        var teams = StreamUtils.filter(getAllTeams(), team -> containsIgnoreCase(team.getName(), name));
        teams.sort(comparing(NaisTeam::getName, startsWith(name)));
        return teams;
    }

    private List<ConsoleTeam> getAllTeamsFromConsole() {
        return client.document(ConsoleTeam.TEAMS_QUERY)
                .execute()
                .map(response -> response.field("teams").toEntity(new ParameterizedTypeReference<List<ConsoleTeam>>() {
                }))
                .block();
    }

    private ConsoleTeam getSingleTeamFromConsole(String teamId) {
        var response = client.document(ConsoleTeam.TEAM_QUERY)
                .variable("slug", teamId)
                .execute()
                .block();

        return response.isValid() ? response.field("team").toEntity(ConsoleTeam.class) : null;
    }
}
