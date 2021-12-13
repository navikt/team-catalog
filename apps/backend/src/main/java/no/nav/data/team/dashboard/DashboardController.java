package no.nav.data.team.dashboard;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.domain.ClusterMember;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.dashboard.dto.DashResponse.RoleCount;
import no.nav.data.team.dashboard.dto.DashResponse.TeamSummary;
import no.nav.data.team.dashboard.dto.DashResponse.TeamTypeCount;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.domain.Member;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
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

        var  s = DashResponse.builder()
                .productAreasCount(productAreas.size())
                .clusterCount(clusters.size())
                .resources(nomClient.count())
                .resourcesDb(nomClient.countDb())

                .total(calcForTotal(teams, productAreas, clusters))

                .productAreas(convert(productAreas,
                        pa -> calcForArea(teams, pa, clusters)

                ))
                .clusters(convert(clusters, cluster -> calcForCluster(filter(teams, t -> copyOf(t.getClusterIds()).contains(cluster.getId())), cluster, clusters)))

                .areaSummaryMap(createAreaSummaryMap(teams, productAreas, clusters))
                .clusterSummaryMap(createClusterSummaryMap(teams, clusters))

                .teamSummaryMap(createTeamSummaryMap(teams, productAreas, clusters))
                .build();

        return s;
    }

    private Map<UUID, DashResponse.ClusterSummary> createClusterSummaryMap(List<Team> teams, List<Cluster> clusters) {

        var map = new HashMap<UUID, DashResponse.ClusterSummary>();

        for (var cluster: clusters){

            var relatedTeams = teams.stream()
                    .filter(team -> team.getClusterIds().contains(cluster.getId())
            ).toList();

            var clusterMembers = cluster.getMembers();

            var clusterSubteamMembers = relatedTeams.stream()
                    .flatMap(team -> team.getMembers().stream()).toList();

            var totalMembershipCount = (long) clusterMembers.size() + (long) clusterSubteamMembers.size();


            var totaluniqueResources = StreamUtils.distinctByKey(
            List.of(
                    clusterMembers.stream().map(it -> it.getNavIdent()),
                    clusterSubteamMembers.stream().map(it -> it.getNavIdent())

            ).stream().reduce((a,b) -> Stream.concat(a,b)).get().toList(), it -> it
            );

            var uniqueResourcesExternal = totaluniqueResources.stream()
                    .map(ident -> nomClient.getByNavIdent(ident).orElse(null))
                    .filter(Objects::nonNull)
                    .filter(ressource -> ressource.getResourceType().equals(ResourceType.EXTERNAL))
                    .count();




            map.put(cluster.getId(), DashResponse.ClusterSummary.builder()
                            .totalMembershipCount(totalMembershipCount)
                            .totalUniqueResourcesCount(totaluniqueResources.stream().count())
                            .uniqueResourcesExternal(uniqueResourcesExternal)
                            .teamCount(relatedTeams.stream().count())

                            .build());

        }

        return map;
    }

    private Map<UUID, DashResponse.TeamSummary2> createTeamSummaryMap(List<Team> teams, List<ProductArea> productAreas, List<Cluster> clusters) {
        var map = new HashMap<UUID, DashResponse.TeamSummary2>();

        for(var team : teams){

            var uniqueResourcesExternal = team.getMembers().stream()
                    .map(teamMember -> nomClient.getByNavIdent(teamMember.getNavIdent()).orElse(null))
                    .filter(Objects::nonNull)
                    .filter(resource -> resource.getResourceType().equals(ResourceType.EXTERNAL))
                    .count();

            DashResponse.TeamSummary2.builder()
                    .membershipCount(team.getMembers().stream().count())
                    .ResourcesExternal(uniqueResourcesExternal);
        }



        return map;
    }

    private Map<UUID, DashResponse.AreaSummary> createAreaSummaryMap(List<Team> teams, List<ProductArea> productAreas, List<Cluster> clusters) {
        var map = new HashMap<UUID, DashResponse.AreaSummary>();

        for (var pa: productAreas){

            var relatedClusters = clusters.stream().filter(cl -> cl.getProductAreaId().equals(pa.getId())).toList();
            var relatedTeams = teams.stream().filter(team ->
                    pa.getId().equals(team.getProductAreaId())
            ).toList();
            long clusterCount = relatedClusters.size();

            var relatedClusterMembers = relatedClusters.stream().flatMap(cluster -> {return cluster.getMembers().stream();}).toList();
            var subteamMembers = relatedTeams.stream().flatMap(team -> {return team.getMembers().stream();}).toList();
            var relatedClusterSubteams = relatedClusters.stream()
                    .flatMap(cluster -> teams.stream()
                            .filter(team -> team.getClusterIds().contains(cluster.getId()))
                    ).toList();

            var allSubteams = relatedClusterSubteams.stream().map(it -> it.getId()).collect(Collectors.toSet());
            allSubteams.addAll(relatedTeams.stream().map(it -> it.getId()).collect(Collectors.toSet()));



            var clusterSubTeamMembers = teams.stream()
                    .filter(team -> {
                        var teamOverlap = team.getClusterIds().stream()
                                .anyMatch(teamClusterId -> relatedClusters.stream()
                                        .map(cl -> cl.getId())
                                        .anyMatch(clId -> clId.equals(teamClusterId)));
//                        return team.getClusterIds().removeAll(relatedClusters.stream().map(it -> it.getId()).toList());
                        return teamOverlap;
                    })
                    .filter(team -> {return (relatedClusterSubteams.stream()
                        .map(it -> it.getId())
                        .toList()).contains(team.getId());
                    }
                    )
                    .flatMap(subteam -> {return subteam.getMembers().stream();}).toList();




            long membershipCount = pa.getMembers().size() + relatedClusterMembers.size() + subteamMembers.size()  + clusterSubTeamMembers.size();

            var uniqueResources = StreamUtils.distinctByKey(
                    List.of(
                            pa.getMembers().stream().map(it -> it.getNavIdent()),
                            relatedClusterMembers.stream().map(it -> it.getNavIdent()),
                            subteamMembers.stream().map(it ->  it.getNavIdent()),
                            clusterSubTeamMembers.stream().map(it -> it.getNavIdent())

                    ).stream().reduce((a,b) -> Stream.concat(a,b)).get().toList(), it -> it
            );

            var uniqueResourcesExternal = uniqueResources.stream()
                    .map(ident -> nomClient.getByNavIdent(ident).orElse(null))
                    .filter(Objects::nonNull)
                    .filter(ressource -> ressource.getResourceType().equals(ResourceType.EXTERNAL))
                    .count();


            map.put(pa.getId(), DashResponse.AreaSummary.builder()
                            .clusterCount(clusterCount)
                            .membershipCount(membershipCount)
                            .uniqueResourcesCount(uniqueResources.stream().count())
                            .totalTeamCount(allSubteams.stream().count())
                            .uniqueResourcesExternal(uniqueResourcesExternal)


                    .build());
        }


        return map;
    }
    // TODO
//    private Long calculateUniqueResourceForArea(ProductArea pa, List<ClusterMember> relatedClusterMembers, List<TeamMember> subteamMembers, List<ClusterMember> clusterMembers, List<TeamMember> clusterSubTeamMembers) {
    private Long calculateUniqueResourceForArea(ProductArea pa, List<ClusterMember> relatedClusterMembers, List<TeamMember> subteamMembers, List<TeamMember> clusterSubTeamMembers) {


        return null;
    }

    private TeamSummary calcForTotal(List<Team> teams, List<ProductArea> productAreas, List<Cluster> clusters) {
        return calcForTeams(teams, null, productAreas, null, clusters);
    }

    private TeamSummary calcForArea(List<Team> teams, ProductArea productArea, List<Cluster> clusters) {
        return calcForTeams(teams, productArea, List.of(), null, clusters);
    }

    private TeamSummary calcForCluster(List<Team> teams, Cluster cluster, List<Cluster> clusters) {
        return calcForTeams(teams, null, List.of(), cluster, clusters);
    }

    private TeamSummary calcForTeams(List<Team> teams, ProductArea productArea, List<ProductArea> productAreas, Cluster cluster, List<Cluster> clusters) {
        Map<TeamRole, Integer> roles = new EnumMap<>(TeamRole.class);
        Map<TeamType, Integer> teamTypes = new EnumMap<>(TeamType.class);

        Map<Integer, List<Team>> teamsBuckets = teams.stream().collect(Collectors.groupingBy(t -> groups.ceiling(t.getMembers().size())));
        Map<Integer, List<Team>> extPercentBuckets = teams.stream().collect(Collectors.groupingBy(t -> extPercentGroups.ceiling(percentExternalMembers(t))));

        teams.stream().flatMap(t -> t.getMembers().stream()).flatMap(m -> m.getRoles().stream()).forEach(r -> roles.compute(r, counter));
        teams.forEach(t -> teamTypes.compute(t.getTeamType() == null ? TeamType.UNKNOWN : t.getTeamType(), counter));

        List<Member> productAreaMembers;
        if (cluster != null) {
            productAreaMembers = List.of();
        } else {
            if (productArea != null) {
                productAreaMembers = productArea.getMembersAsSuper();
            } else {
                productAreaMembers = productAreas.stream().flatMap(pa -> pa.getMembers().stream()).collect(Collectors.toList());
            }
        }
        productAreaMembers.stream().flatMap(m -> m.getRoles().stream()).forEach(r -> roles.compute(r, counter));

        List<Member> clusterMembers;
        List<Cluster> paClusters = null;
        if (productArea != null) {
            paClusters = filter(clusters, cl -> productArea.getId().equals(cl.getProductAreaId()));
            clusterMembers = paClusters.stream().flatMap(cl -> cl.getMembers().stream()).collect(Collectors.toList());
        } else {
            if (cluster != null) {
                clusterMembers = cluster.getMembersAsSuper();
            } else {
                clusterMembers = clusters.stream().flatMap(cl -> cl.getMembers().stream()).collect(Collectors.toList());
            }
        }
        clusterMembers.stream().flatMap(m -> m.getRoles().stream()).forEach(r -> roles.compute(r, counter));

        return TeamSummary.builder()
                .productAreaId(productArea != null ? productArea.getId() : null)
                .clusterId(cluster != null ? cluster.getId() : null)
                .clusters(paClusters != null ? (long) paClusters.size() : null)
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

                .uniqueResources(countUniqueResources(teams, productAreaMembers, clusterMembers))
                .uniqueResourcesExternal(countUniqueResourcesExternal(teams, productAreaMembers, clusterMembers))
                .totalResources(countResources(teams, productAreaMembers, clusterMembers))

                .roles(roles.entrySet().stream()
                        .map(e -> new RoleCount(e.getKey(), e.getValue())).collect(Collectors.toList()))
                .teamTypes(teamTypes.entrySet().stream()
                        .map(e -> new TeamTypeCount(e.getKey(), e.getValue()))
                        .sorted(Comparator.comparing(TeamTypeCount::getCount))
                        .collect(Collectors.toList()))
                .build();
    }

    private long countUniqueResourcesExternal(List<Team> teams, List<Member> productAreaMembers, List<Member> clusterMembers) {
        return Stream.concat(
                Stream.concat(
                        productAreaMembers.stream().map(Member::convertToResponse),
                        teams.stream().flatMap(team -> team.getMembers().stream()).map(TeamMember::convertToResponse)
                ),
                clusterMembers.stream().map(Member::convertToResponse)
        )
                .filter(m -> ResourceType.EXTERNAL == m.getResource().getResourceType())
                .map(MemberResponse::getNavIdent).distinct()
                .count();
    }

    private long countUniqueResources(List<Team> teams, List<Member> productAreaMembers, List<Member> clusterMembers) {
        return Stream.concat(
                Stream.concat(
                        productAreaMembers.stream().map(Member::getNavIdent),
                        teams.stream().flatMap(team -> team.getMembers().stream().map(TeamMember::getNavIdent))
                ), clusterMembers.stream().map(Member::getNavIdent)
        ).distinct().count();

    }

    private long countResources(List<Team> teams, List<Member> productAreaMembers, List<Member> clusterMembers) {
        return teams.stream().mapToLong(team -> team.getMembers().size()).sum() +
                productAreaMembers.size() + clusterMembers.size();
    }

    private int percentExternalMembers(Team t) {
        if (t.getMembers().isEmpty()) {
            return 0;
        }
        long externalMembers = t.getMembers().stream().map(TeamMember::convertToResponse).filter(m -> ResourceType.EXTERNAL == m.getResource().getResourceType()).count();
        return ((int) externalMembers * 100) / t.getMembers().size();
    }

    @Scheduled(initialDelayString = "PT2M", fixedRateString = "PT30S")
    public void warmup() {
        getDashboardData();
    }

}
