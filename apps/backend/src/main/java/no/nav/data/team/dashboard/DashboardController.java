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
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import static java.util.Objects.requireNonNull;
import static no.nav.data.team.common.utils.StreamUtils.filter;


@Slf4j
@RestController
@CrossOrigin
@RequestMapping("/dash")
@Api(value = "Dashboard", tags = {"Dashboard"})
public class DashboardController {

    private final TeamService teamService;
    private final NomClient nomClient;
    private final LoadingCache<String, DashResponse> dashData;
    private final TreeSet<Integer> groups = new TreeSet<>(Set.of(0, 5, 10, 20, Integer.MAX_VALUE));

    public DashboardController(TeamService teamService, NomClient nomClient) {
        this.teamService = teamService;
        this.nomClient = nomClient;
        this.dashData = Caffeine.newBuilder().recordStats()
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
        Map<TeamRole, Integer> roles = new EnumMap<>(TeamRole.class);
        List<Team> teams = teamService.getAll();
        Map<Integer, List<Team>> teamsBuckets = teams.stream().collect(Collectors.groupingBy(t -> groups.ceiling(t.getMembers().size())));
        teams.stream().flatMap(t -> t.getMembers().stream()).flatMap(m -> m.getRoles().stream()).forEach(r -> roles.compute(r, (k, v) -> v == null ? 1 : v + 1));
        return DashResponse.builder()
                .teams(teams.size())
                .teamsEditedLastWeek(filter(teams, t -> t.getChangeStamp().getLastModifiedDate().isAfter(LocalDateTime.now().minusDays(7))).size())

                .teamEmpty(teamsBuckets.get(0).size())
                .teamUpTo5(teamsBuckets.get(5).size())
                .teamUpTo10(teamsBuckets.get(10).size())
                .teamUpTo20(teamsBuckets.get(20).size())
                .teamOver20(teamsBuckets.get(Integer.MAX_VALUE).size())

                .uniqueResourcesInATeam(teams.stream().flatMap(team -> team.getMembers().stream()).map(TeamMember::getNavIdent).distinct().count())
                .resources(nomClient.count())

                .roles(roles.entrySet().stream().map(e -> new RoleCount(e.getKey(), e.getValue())).collect(Collectors.toList()))

                .build();
    }

}
