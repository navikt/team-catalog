package no.nav.data.team.naisteam;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.extern.slf4j.Slf4j;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.time.temporal.ChronoUnit.MINUTES;
import static java.util.Collections.singletonList;
import static java.util.Comparator.comparing;
import static no.nav.data.common.utils.StartsWithComparator.startsWith;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static org.apache.commons.lang3.StringUtils.containsIgnoreCase;

@Slf4j
@Service
@EnableConfigurationProperties(NaisConsoleProperties.class)
public class NaisConsoleClient {

    private final GraphQlClient client;

    private final LoadingCache<String, List<NaisTeam>> allTeamsCache;
    private final LoadingCache<String, NaisTeam> teamCache;

    public NaisConsoleClient(WebClient.Builder builder, NaisConsoleProperties consoleProperties) {
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
                .build(k -> fetchAllNaisTeams());

        this.teamCache = Caffeine.newBuilder()
                .recordStats()
                .expireAfterWrite(Duration.of(10, MINUTES))
                .maximumSize(100)
                .build(this::fetchNaisTeam);

        MetricUtils.register("NaisConsoleTeamsCache", allTeamsCache);
        MetricUtils.register("NaisConsoleTeamCache", teamCache);
    }

    public List<NaisTeam> getAllNaisTeams() {
        List<NaisTeam> naisTeams = allTeamsCache.get("singleton");
        return safeStream(naisTeams)
                .distinct()
                .filter(team -> StringUtils.isNotBlank(team.slug()))
                .sorted(comparing(NaisTeam::slug))
                .toList();
    }

    public Optional<NaisTeam> getNaisteam(String teamId) {
        return Optional.ofNullable(teamCache.get(teamId));
    }

    public List<NaisTeam> searchForNaisTeams(String name) {
        var teams = StreamUtils.filter(getAllNaisTeams(), team -> containsIgnoreCase(team.slug(), name));
        teams.sort(comparing(NaisTeam::slug, startsWith(name)));
        return teams;
    }

    public boolean naisTeamExists(String teamId) {
        return getAllNaisTeams().stream().anyMatch(team -> team.slug().equals(teamId));
    }

    private List<NaisTeam> fetchAllNaisTeams() {
        List<NaisTeam> allTeams = new ArrayList<>();
        String cursor = "";
        boolean hasNextPage = true;

        while (hasNextPage) {
            var response = client.document(NaisTeam.TEAMS_QUERY)
                .variable("first", 100)
                .variable("after", cursor)
                .execute()
                .block();

            if (response != null && response.isValid()) {
                var teams = response
                    .field("teams.nodes")
                    .toEntity(new ParameterizedTypeReference<List<NaisTeam>>() {});

                if (teams != null) {
                    allTeams.addAll(teams);
                }

                cursor = response.field("teams.pageInfo.endCursor").toEntity(String.class);
                hasNextPage = Boolean.TRUE.equals(response.field("teams.pageInfo.hasNextPage").toEntity(Boolean.class));
            } else {
                log.error("fetchAllNaisTeams: Received a null response from the GraphQL query.");
                break;
            }
        }

        log.info("fetchAllNaisTeams: Fetched {} nais-teams in total.", allTeams.size());
        return allTeams;
    }

    private NaisTeam fetchNaisTeam(String slug) {
        var response = client.document(NaisTeam.TEAM_QUERY)
                .variable("slug", slug)
                .execute()
                .block();

        return response != null && response.isValid() ? response.field("team").toEntity(NaisTeam.class) : null;
    }
}
