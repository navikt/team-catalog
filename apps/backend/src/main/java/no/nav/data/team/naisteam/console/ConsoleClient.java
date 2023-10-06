package no.nav.data.team.naisteam.console;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.common.utils.StreamUtils;
import org.apache.commons.lang3.StringUtils;
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
@EnableConfigurationProperties(NaisConsoleProperties.class)
public class ConsoleClient {

    private final GraphQlClient client;

    private final LoadingCache<String, List<ConsoleTeam>> allTeamsCache;
    private final LoadingCache<String, ConsoleTeam> teamCache;

    public ConsoleClient(WebClient.Builder builder, NaisConsoleProperties consoleProperties) {
        client = HttpGraphQlClient.builder(builder)
                .webClient(client -> {
                    client.baseUrl(consoleProperties.baseUrl());
                    client.defaultHeaders(headers -> {
                        headers.put(HttpHeaders.AUTHORIZATION, singletonList("Bearer " + consoleProperties.auth().token()));
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

    public List<ConsoleTeam> getAllTeams() {
        List<ConsoleTeam> consoleTeams = allTeamsCache.get("singleton");
        return safeStream(consoleTeams)
                .distinct()
                .filter(team -> StringUtils.isNotBlank(team.slug()))
                .sorted(comparing(ConsoleTeam::slug))
                .toList();
    }

    public Optional<ConsoleTeam> getTeam(String teamId) {
        return Optional.ofNullable(teamCache.get(teamId));
    }

    public List<ConsoleTeam> search(String name) {
        var teams = StreamUtils.filter(getAllTeams(), team -> containsIgnoreCase(team.slug(), name));
        teams.sort(comparing(ConsoleTeam::slug, startsWith(name)));
        return teams;
    }

    public boolean teamExists(String teamId) {
        return getAllTeams().stream().anyMatch(team -> team.slug().equals(teamId));
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
