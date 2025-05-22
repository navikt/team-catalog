package no.nav.data.team.dashboard;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.location.LocationRepository;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.shared.domain.Member;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static no.nav.data.common.utils.StreamUtils.*;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DashCacheProvider {
    private final ProductAreaService productAreaService;
    private final TeamService teamService;
    private final ClusterService clusterService;
    private final NomClient nomClient;
    private final LocationRepository locationRepository;

    private static final List<Team> E = List.of();
    private static final TreeSet<Integer> groups = new TreeSet<>(Set.of(0, 5, 10, 20, Integer.MAX_VALUE));
    private static final TreeSet<Integer> extPercentGroups = new TreeSet<>(Set.of(0, 25, 50, 75, 100));
    private static final BiFunction<Object, Integer, Integer> counter = (k, v) -> v == null ? 1 : v + 1;

    @Bean(name="dashCache")
    public LoadingCache<String, DashResponse> getDashCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(1))
                .maximumSize(1).build(k -> calcDash());
    }

    private DashResponse calcDash() {
        List<Team> teamsActive = teamService.getAllActive();
        List<ProductArea> productAreasActive = productAreaService.getAllActive();
        List<Cluster> clustersActive = clusterService.getAllActive();

        List<Team> teamsAll = teamService.getAll();
        List<ProductArea> productAreasAll = productAreaService.getAll();
        List<Cluster> clustersAll = clusterService.getAll();

        return DashResponse.builder()
                .teamsCount(teamsActive.size())
                .productAreasCount(productAreasActive.size())
                .clusterCount(clustersActive.size())
                .resources(nomClient.count())
                .resourcesDb(nomClient.countDb())

                .teamsCountPlanned(teamsAll.stream().filter(team -> team.getStatus().equals(DomainObjectStatus.PLANNED)).count())
                .teamsCountInactive(teamsAll.stream().filter(team -> team.getStatus().equals(DomainObjectStatus.INACTIVE)).count())

                .productAreasCountPlanned(productAreasAll.stream().filter(po -> po.getStatus().equals(DomainObjectStatus.PLANNED)).count())
                .productAreasCountInactive(productAreasAll.stream().filter(po -> po.getStatus().equals(DomainObjectStatus.INACTIVE)).count())

                .clusterCountPlanned(clustersAll.stream().filter(cluster -> cluster.getStatus().equals(DomainObjectStatus.PLANNED)).count())
                .clusterCountInactive(clustersAll.stream().filter(cluster -> cluster.getStatus().equals(DomainObjectStatus.INACTIVE)).count())

                .total(calcForTotal(teamsActive, productAreasActive, clustersActive))
                .productAreas(convert(productAreasActive, pa -> calcForArea(filter(teamsActive, t -> pa.getId().equals(t.getProductAreaId())), pa, clustersActive)))
                .clusters(convert(clustersActive, cluster -> calcForCluster(filter(teamsActive, t -> copyOf(t.getClusterIds()).contains(cluster.getId())), cluster, clustersActive)))

                .areaSummaryMap(createAreaSummaryMap(teamsActive, productAreasActive, clustersActive))
                .clusterSummaryMap(createClusterSummaryMap(teamsActive, clustersActive))
                .teamSummaryMap(createTeamSummaryMap(teamsActive, productAreasActive, clustersActive))

                .locationSummaryMap(createLocationSummaryMap(teamsActive))

                .build();
    }


    private <T> void accumulateSubList(HashMap<String, ArrayList<T>> targetMap, String mapKey, List<T> subList ){
        val prev = targetMap.get(mapKey);
        if(prev == null){
            targetMap.put(mapKey,new ArrayList<>(subList));
        }else{
            prev.addAll(subList);
        }
    }

    private <T> long countUnique(List<T> listWithPossibleDuplicates){
        val acc = new ArrayList<T>();
        for(val item : listWithPossibleDuplicates){
            if(!acc.contains(item)) {
                acc.add(item);
            }
        }
        return acc.size();
    }


    private Map<String, DashResponse.LocationSummary> createLocationSummaryMap(List<Team> teams) {

        val out = new HashMap<String, DashResponse.LocationSummary>();

        val locationToNavIdentList = new HashMap<String, ArrayList<String>>();
        val locationToTeamIdList = new HashMap<String,ArrayList<UUID>>();

        val locationDayToNavIdentList = new HashMap<String,ArrayList<String>>();
        val locationDayToTeamIdList = new HashMap<String,ArrayList<UUID>>();

        for(var team : teams){
            val officeHours = team.getOfficeHours();
            if(officeHours == null) {
                continue;
            }
            val teamLocCode = officeHours.getLocationCode();

            @SuppressWarnings("OptionalGetWithoutIsPresent")
            val teamLoc = locationRepository.getLocationByCode(teamLocCode).get();
            val teamMemberList = team.getMembers().stream().map(TeamMember::getNavIdent).toList();

            accumulateSubList(locationToNavIdentList,teamLoc.getCode(),teamMemberList);
            accumulateSubList(locationToTeamIdList,teamLoc.getCode(),List.of(team.getId()));
            for(val day : officeHours.getDays()){
                val mapKeyStr = teamLoc.getCode() + "/" + day.name();
                accumulateSubList(locationDayToNavIdentList, mapKeyStr, teamMemberList);
                accumulateSubList(locationDayToTeamIdList, mapKeyStr, List.of(team.getId()));
            }

            var parentLoc = teamLoc.getParent();
            while (parentLoc != null) {
                val parentLocCode = parentLoc.getCode();
                accumulateSubList(locationToNavIdentList, parentLocCode, teamMemberList);
                accumulateSubList(locationToTeamIdList, parentLocCode, List.of(team.getId()));

                for (val day : officeHours.getDays()) {
                    val mapKeyStr = parentLocCode + "/" + day.name();
                    accumulateSubList(locationDayToNavIdentList, mapKeyStr, teamMemberList);
                    accumulateSubList(locationDayToTeamIdList, mapKeyStr, List.of(team.getId()));
                }

                parentLoc = parentLoc.getParent();
            }
        }

        val allLocations = locationRepository.getAll();
        for(val loc : allLocations){

            val locNavIdList = locationToNavIdentList.get(loc.getCode());
            val resCount = locNavIdList != null ? countUnique(locNavIdList) : 0;

            val locTeamIdList = locationToTeamIdList.get(loc.getCode());
            val teamCount = locTeamIdList != null ? countUnique(locTeamIdList) : 0;

            val locSumBuilder = DashResponse.LocationSummary.builder()
                    .resourceCount(resCount)
                    .teamCount( teamCount );

            val weekDays = List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY);
            for(val day : weekDays){
                val mapKeyStr = loc.getCode() + "/" + day.name();
                val locDayNavIdList = locationDayToNavIdentList.get(mapKeyStr);
                val resCountDay = locDayNavIdList != null ? countUnique(locDayNavIdList) : 0;

                val locDayTeamIdList = locationDayToTeamIdList.get(mapKeyStr);
                val teamCountDay = locDayTeamIdList != null ? countUnique(locDayTeamIdList) : 0;

                switch(day){
                    case MONDAY -> locSumBuilder.monday(new DashResponse.LocationDaySummary(teamCountDay,resCountDay));
                    case TUESDAY -> locSumBuilder.tuesday(new DashResponse.LocationDaySummary(teamCountDay,resCountDay));
                    case WEDNESDAY -> locSumBuilder.wednesday(new DashResponse.LocationDaySummary(teamCountDay,resCountDay));
                    case THURSDAY -> locSumBuilder.thursday(new DashResponse.LocationDaySummary(teamCountDay,resCountDay));
                    case FRIDAY -> locSumBuilder.friday(new DashResponse.LocationDaySummary(teamCountDay,resCountDay));
                }
            }

            out.put(loc.getCode(),locSumBuilder.build());
        }

        return out;
    }

    private Map<UUID, DashResponse.ClusterSummary> createClusterSummaryMap(List<Team> teams, List<Cluster> clusters) {
        val map = new HashMap<UUID, DashResponse.ClusterSummary>();

        for (val cluster: clusters){

            val relatedTeams = teams.stream()
                    .filter(team -> team.getClusterIds().contains(cluster.getId())
                    ).toList();

            val clusterSubteamMembers = relatedTeams.stream()
                    .flatMap(team -> team.getMembers().stream()).toList();

            val totalMembershipCount = (long) cluster.getMembers().size() + (long) clusterSubteamMembers.size();


            val totaluniqueResources = StreamUtils.distinctByKey(
                    List.of(
                            cluster.getMembers().stream().map(it -> it.getNavIdent()),
                            clusterSubteamMembers.stream().map(it -> it.getNavIdent())

                    ).stream().reduce((a,b) -> Stream.concat(a,b)).get().toList(), it -> it
            );

            val uniqueResourcesExternal = totaluniqueResources.stream()
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
        val map = new HashMap<UUID, DashResponse.TeamSummary2>();

        for(val team : teams){

            val uniqueResourcesExternal = team.getMembers().stream()
                    .map(teamMember -> nomClient.getByNavIdent(teamMember.getNavIdent()).orElse(null))
                    .filter(Objects::nonNull)
                    .filter(resource -> resource.getResourceType().equals(ResourceType.EXTERNAL))
                    .count();


            map.put(team.getId(), DashResponse.TeamSummary2.builder()
                    .membershipCount(team.getMembers().stream().count())
                    .ResourcesExternal(uniqueResourcesExternal).build());



        }

        return map;
    }

    private Map<UUID, DashResponse.AreaSummary> createAreaSummaryMap(List<Team> teams, List<ProductArea> productAreas, List<Cluster> clusters) {
        val map = new HashMap<UUID, DashResponse.AreaSummary>();

        for (val pa: productAreas){

            val relatedClusters = clusters.stream().filter(cl -> pa.getId().equals(cl.getProductAreaId())).toList();



            val relatedTeams = teams.stream().filter(team ->
                    pa.getId().equals(team.getProductAreaId())
            ).toList();
            long clusterCount = relatedClusters.size();

            val relatedClusterMembers = relatedClusters.stream().flatMap(cluster -> {return cluster.getMembers().stream();}).toList();
            val subteamMembers = relatedTeams.stream().flatMap(team -> {return team.getMembers().stream();}).toList();
            val relatedClusterSubteams = relatedClusters.stream()
                    .flatMap(cluster -> teams.stream()
                            .filter(team -> team.getClusterIds().contains(cluster.getId()))
                    ).toList();

            val allSubteams = relatedClusterSubteams.stream().map(it -> it.getId()).collect(Collectors.toSet());
            allSubteams.addAll(relatedTeams.stream().map(it -> it.getId()).collect(Collectors.toSet()));



//            val clusterSubTeamMembers = teams.stream()
//                    .filter(team -> {
//                        val teamBelongsToAreaByCluster = relatedClusters.stream()
//                                .map(cl -> cl.getId())
//                                .anyMatch(clId -> team.getClusterIds().contains(clId));
//                        return teamBelongsToAreaByCluster;
//                    })
//                    .filter(team -> {return (relatedClusterSubteams.stream()
//                        .map(it -> it.getId())
//                        .toList()).contains(team.getId());
//                    }
//                    )
//                    .flatMap(subteam -> {return subteam.getMembers().stream();}).toList();


//            long membershipCount = pa.getMembers().size() + relatedClusterMembers.size() + subteamMembers.size()  + clusterSubTeamMembers.size();
            long membershipCount = pa.getMembers().size() + relatedClusterMembers.size() + subteamMembers.size();

            val uniqueResources = StreamUtils.distinctByKey(
                    List.of(
                            pa.getMembers().stream().map(it -> it.getNavIdent()),
                            relatedClusterMembers.stream().map(it -> it.getNavIdent()),
                            subteamMembers.stream().map(it ->  it.getNavIdent())
//                            clusterSubTeamMembers.stream().map(it -> it.getNavIdent())

                    ).stream().reduce((a,b) -> Stream.concat(a,b)).get().toList(), it -> it
            );

            val uniqueResourcesExternal = uniqueResources.stream()
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


    private DashResponse.TeamSummary calcForTotal(List<Team> teams, List<ProductArea> productAreas, List<Cluster> clusters) {
        return calcForTeams(teams, null, productAreas, null, clusters);
    }

    private DashResponse.TeamSummary calcForArea(List<Team> teams, ProductArea productArea, List<Cluster> clusters) {
        return calcForTeams(teams, productArea, List.of(), null, clusters);
    }

    private DashResponse.TeamSummary calcForCluster(List<Team> teams, Cluster cluster, List<Cluster> clusters) {
        return calcForTeams(teams, null, List.of(), cluster, clusters);
    }

    private DashResponse.TeamSummary calcForTeams(List<Team> teams, ProductArea productArea, List<ProductArea> productAreas, Cluster cluster, List<Cluster> clusters) {
        Map<TeamRole, Integer> roles = new EnumMap<>(TeamRole.class);
        Map<TeamOwnershipType, Integer> teamOwnershipTypes = new EnumMap<>(TeamOwnershipType.class);
        Map<TeamType, Integer> teamTypes = new EnumMap<>(TeamType.class);

        Map<Integer, List<Team>> teamsBuckets = teams.stream().collect(Collectors.groupingBy(t -> groups.ceiling(t.getMembers().size())));
        Map<Integer, List<Team>> extPercentBuckets = teams.stream().collect(Collectors.groupingBy(t -> extPercentGroups.ceiling(percentExternalMembers(t))));

        teams.stream().flatMap(t -> t.getMembers().stream()).flatMap(m -> m.getRoles().stream()).forEach(r -> roles.compute(r, counter));
        teams.forEach(t -> teamOwnershipTypes.compute(t.getTeamOwnershipType() == null ? TeamOwnershipType.UNKNOWN : t.getTeamOwnershipType(), counter));
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

        return DashResponse.TeamSummary.builder()
                .productAreaId(productArea != null ? productArea.getId() : cluster != null ? cluster.getProductAreaId() : null)
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
                        .map(e -> new DashResponse.RoleCount(e.getKey(), e.getValue())).collect(Collectors.toList()))
                .teamOwnershipTypes(teamOwnershipTypes.entrySet().stream()
                        .map(e -> new DashResponse.TeamOwnershipTypeCount(e.getKey(), e.getValue()))
                        .sorted(Comparator.comparing(DashResponse.TeamOwnershipTypeCount::getCount))
                        .collect(Collectors.toList()))
                .teamTypes(teamTypes.entrySet().stream()
                        .map(e -> new DashResponse.TeamTypeCount(e.getKey(), e.getValue()))
                        .sorted(Comparator.comparing(DashResponse.TeamTypeCount::getCount))
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

}
