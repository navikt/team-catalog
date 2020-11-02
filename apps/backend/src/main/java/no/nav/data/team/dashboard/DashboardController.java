package no.nav.data.team.dashboard;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.dashboard.dto.DashResponse.RoleCount;
import no.nav.data.team.dashboard.dto.DashResponse.TeamSummary;
import no.nav.data.team.dashboard.dto.DashResponse.TeamTypeCount;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.copyOf;
import static no.nav.data.common.utils.StreamUtils.filter;


@Slf4j
@RestController
@RequestMapping("/dash")
@Tag(name = "Dashboard")
public class DashboardController {

    private final ProductAreaService productAreaService;
    private final TeamService teamService;
    private final ClusterService clusterService;
    private final NomClient nomClient;
    private final LoadingCache<String, DashResponse> dashData;

    private static final List<Team> E = List.of();
    private static final TreeSet<Integer> groups = new TreeSet<>(Set.of(0, 5, 10, 20, Integer.MAX_VALUE));
    private static final TreeSet<Integer> extPercentGroups = new TreeSet<>(Set.of(0, 25, 50, 75, 100));
    private static final BiFunction<Object, Integer, Integer> counter = (k, v) -> v == null ? 1 : v + 1;

    public DashboardController(ProductAreaService productAreaService, TeamService teamService, ClusterService clusterService, NomClient nomClient) {
        this.productAreaService = productAreaService;
        this.teamService = teamService;
        this.clusterService = clusterService;
        this.nomClient = nomClient;
        this.dashData = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(1))
                .maximumSize(1).build(k -> calcDash());
    }

    @Operation(summary = "Get Dashboard data")
    @ApiResponse(description = "Data fetched")
    @GetMapping
    public ResponseEntity<DashResponse> getDashboardData() {
        return ResponseEntity.ok(requireNonNull(dashData.get("singleton")));
    }

    private DashResponse calcDash() {
        List<Team> teams = teamService.getAll();
        List<ProductArea> productAreas = productAreaService.getAll();
        List<Cluster> clusters = clusterService.getAll();

        return DashResponse.builder()
                .productAreasCount(productAreas.size())
                .clusterCount(clusters.size())
                .resources(nomClient.count())
                .resourcesDb(nomClient.countDb())

                .total(calcForTotal(teams, productAreas))
                .productAreas(convert(productAreas, pa -> calcForArea(filter(teams, t -> pa.getId().equals(t.getProductAreaId())), pa)))
                .clusters(convert(clusters, cluster -> calcForCluster(filter(teams, t -> copyOf(t.getClusterIds()).contains(cluster.getId())), cluster)))
                .build();
    }

    private TeamSummary calcForTotal(List<Team> teams, List<ProductArea> productAreas) {
        return calcForTeams(teams, null, productAreas, null);
    }

    private TeamSummary calcForArea(List<Team> teams, ProductArea productArea) {
        return calcForTeams(teams, productArea, List.of(), null);
    }

    private TeamSummary calcForCluster(List<Team> teams, Cluster cluster) {
        return calcForTeams(teams, null, List.of(), cluster);
    }

    private TeamSummary calcForTeams(List<Team> teams, ProductArea productArea, List<ProductArea> productAreas, Cluster cluster) {
        Map<TeamRole, Integer> roles = new EnumMap<>(TeamRole.class);
        Map<TeamType, Integer> teamTypes = new EnumMap<>(TeamType.class);

        Map<Integer, List<Team>> teamsBuckets = teams.stream().collect(Collectors.groupingBy(t -> groups.ceiling(t.getMembers().size())));
        Map<Integer, List<Team>> extPercentBuckets = teams.stream().collect(Collectors.groupingBy(t -> extPercentGroups.ceiling(percentExternalMembers(t))));

        teams.stream().flatMap(t -> t.getMembers().stream()).flatMap(m -> m.getRoles().stream()).forEach(r -> roles.compute(r, counter));
        teams.forEach(t -> teamTypes.compute(t.getTeamType() == null ? TeamType.UNKNOWN : t.getTeamType(), counter));

        List<PaMember> productAreaMembers =
                productArea != null ? productArea.getMembers() : productAreas.stream().flatMap(pa -> pa.getMembers().stream()).collect(Collectors.toList());
        return TeamSummary.builder()
                .productAreaId(productArea != null ? productArea.getId() : null)
                .clusterId(cluster != null ? cluster.getId() : null)
                .teams(teams.size())
                .teamsEditedLastWeek(filter(teams, t -> t.getChangeStamp().getLastModifiedDate().isAfter(LocalDateTime.now().minusDays(7))).size())

                .teamEmpty(teamsBuckets.getOrDefault(0, E).size())
                .teamUpTo5(teamsBuckets.getOrDefault(5, E).size())
                .teamUpTo10(teamsBuckets.getOrDefault(10, E).size())
                .teamUpTo20(teamsBuckets.getOrDefault(20, E).size())
                .teamOver20(teamsBuckets.getOrDefault(Integer.MAX_VALUE, E).size())

                .teamExternal0p(extPercentBuckets.getOrDefault(0, E).size())
                .teamExternalUpto25p(extPercentBuckets.getOrDefault(25, E).size())
                .teamExternalUpto50p(extPercentBuckets.getOrDefault(50, E).size())
                .teamExternalUpto75p(extPercentBuckets.getOrDefault(75, E).size())
                .teamExternalUpto100p(extPercentBuckets.getOrDefault(100, E).size())

                .uniqueResources(countUniqueResources(teams, productAreaMembers))
                .uniqueResourcesExternal(countUniqueResourcesExternal(teams, productAreaMembers))
                .totalResources(countResources(teams, productAreaMembers))

                .roles(roles.entrySet().stream()
                        .map(e -> new RoleCount(e.getKey(), e.getValue())).collect(Collectors.toList()))
                .teamTypes(teamTypes.entrySet().stream()
                        .map(e -> new TeamTypeCount(e.getKey(), e.getValue()))
                        .sorted(Comparator.comparing(TeamTypeCount::getCount))
                        .collect(Collectors.toList()))
                .build();
    }

    private long countUniqueResourcesExternal(List<Team> teams, List<PaMember> productAreaMembers) {
        return Stream.concat(
                productAreaMembers.stream().map(PaMember::convertToResponse),
                teams.stream().flatMap(team -> team.getMembers().stream()).map(TeamMember::convertToResponse)
        )
                .filter(m -> ResourceType.EXTERNAL == m.getResource().getResourceType())
                .map(MemberResponse::getNavIdent).distinct()
                .count();
    }

    private long countUniqueResources(List<Team> teams, List<PaMember> productAreaMembers) {
        return Stream.concat(
                productAreaMembers.stream().map(PaMember::getNavIdent),
                teams.stream().flatMap(team -> team.getMembers().stream().map(TeamMember::getNavIdent))
        ).distinct().count();

    }

    private long countResources(List<Team> teams, List<PaMember> productAreaMembers) {
        return teams.stream().mapToLong(team -> team.getMembers().size()).sum() +
                productAreaMembers.size();
    }

    private int percentExternalMembers(Team t) {
        if (t.getMembers().isEmpty()) {
            return 0;
        }
        long externalMembers = t.getMembers().stream().map(TeamMember::convertToResponse).filter(m -> ResourceType.EXTERNAL == m.getResource().getResourceType()).count();
        return ((int) externalMembers * 100) / t.getMembers().size();
    }

}
