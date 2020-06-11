package no.nav.data.team.dashboard;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.web.bind.annotation.CrossOrigin;
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
import javax.annotation.Nullable;

import static java.util.Objects.requireNonNull;
import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.filter;


@Slf4j
@RestController
@CrossOrigin
@RequestMapping("/dash")
@Api(value = "Dashboard", tags = {"Dashboard"})
public class DashboardController {

    private final ProductAreaService productAreaService;
    private final TeamService teamService;
    private final NomClient nomClient;
    private final LoadingCache<String, DashResponse> dashData;

    private static final List<Team> E = List.of();
    private static final TreeSet<Integer> groups = new TreeSet<>(Set.of(0, 5, 10, 20, Integer.MAX_VALUE));
    private static final TreeSet<Integer> extPercentGroups = new TreeSet<>(Set.of(25, 50, 75, 100));
    private static final BiFunction<Object, Integer, Integer> counter = (k, v) -> v == null ? 1 : v + 1;

    public DashboardController(ProductAreaService productAreaService, TeamService teamService, NomClient nomClient) {
        this.productAreaService = productAreaService;
        this.teamService = teamService;
        this.nomClient = nomClient;
        this.dashData = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(1))
                .maximumSize(1).build(k -> calcDash());
    }

    @ApiOperation(value = "Get Dashboard data")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Data fetched", response = DashResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping
    public ResponseEntity<DashResponse> getDashboardData() {
        return ResponseEntity.ok(requireNonNull(dashData.get("singleton")));
    }

    private DashResponse calcDash() {
        List<Team> teams = teamService.getAll();
        List<ProductArea> productAreas = productAreaService.getAll();

        return DashResponse.builder()
                .productAreasCount(productAreas.size())
                .resources(nomClient.count())
                .resourcesDb(nomClient.countDb())

                .total(calcForTotal(teams, productAreas))
                .productAreas(convert(productAreas, pa -> calcForTeams(filter(teams, t -> pa.getId().toString().equals(t.getProductAreaId())), pa)))
                .build();
    }

    private TeamSummary calcForTotal(List<Team> teams, List<ProductArea> productAreas) {
        return calcForTeams(teams, null, productAreas);
    }

    private TeamSummary calcForTeams(List<Team> teams, ProductArea productArea) {
        return calcForTeams(teams, productArea, List.of());
    }

    private TeamSummary calcForTeams(List<Team> teams, @Nullable ProductArea productArea, List<ProductArea> productAreas) {
        Map<TeamRole, Integer> roles = new EnumMap<>(TeamRole.class);
        Map<TeamType, Integer> teamTypes = new EnumMap<>(TeamType.class);

        Map<Integer, List<Team>> teamsBuckets = teams.stream().collect(Collectors.groupingBy(t -> groups.ceiling(t.getMembers().size())));
        Map<Integer, List<Team>> extPercentBuckets = teams.stream().collect(Collectors.groupingBy(t -> extPercentGroups.ceiling(percentExternalMembers(t))));

        teams.stream().flatMap(t -> t.getMembers().stream()).flatMap(m -> m.getRoles().stream()).forEach(r -> roles.compute(r, counter));
        teams.forEach(t -> teamTypes.compute(t.getTeamType() == null ? TeamType.UNKNOWN : t.getTeamType(), counter));

        List<PaMember> productAreaMembers =
                productArea != null ? productArea.getMembers() : productAreas.stream().flatMap(pa -> pa.getMembers().stream()).collect(Collectors.toList());
        return TeamSummary.builder()
                .productAreaId(productArea != null ? productArea.getId().toString() : null)
                .teams(teams.size())
                .teamsEditedLastWeek(filter(teams, t -> t.getChangeStamp().getLastModifiedDate().isAfter(LocalDateTime.now().minusDays(7))).size())

                .teamEmpty(teamsBuckets.getOrDefault(0, E).size())
                .teamUpTo5(teamsBuckets.getOrDefault(5, E).size())
                .teamUpTo10(teamsBuckets.getOrDefault(10, E).size())
                .teamUpTo20(teamsBuckets.getOrDefault(20, E).size())
                .teamOver20(teamsBuckets.getOrDefault(Integer.MAX_VALUE, E).size())

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
