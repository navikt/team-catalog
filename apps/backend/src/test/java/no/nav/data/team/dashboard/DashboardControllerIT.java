package no.nav.data.team.dashboard;

import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.val;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.domain.ClusterMember;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.dashboard.dto.DashResponse.RoleCount;
import no.nav.data.team.dashboard.dto.DashResponse.TeamTypeCount;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.team.domain.OfficeHours;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;



import static org.assertj.core.api.Assertions.assertThat;

class DashboardControllerIT extends IntegrationTestBase {

    @Autowired
    private LoadingCache<String, DashResponse> getDashCache;

    public static final String RESSURSTYPE_EKSTERN = "EKSTERN";
    public static final String RESSURSTYPE_INTERN = "INTERN";


    @AfterEach
    private void clearCache(){
        getDashCache.invalidateAll();
    }


    @Test
    void getDashboard() {
        addNomResources(
                NomRessurs.builder().navident("a1").ressurstype(RESSURSTYPE_EKSTERN).build(),
                NomRessurs.builder().navident("a2").ressurstype(RESSURSTYPE_EKSTERN).build(),
                NomRessurs.builder().navident("a3").ressurstype(RESSURSTYPE_EKSTERN).build()
        );
        var productArea = storageService.save(ProductArea.builder().build());
        var cluster = storageService
                .save(Cluster.builder().productAreaId(productArea.getId()).members(List.of(ClusterMember.builder().navIdent("a2").role(TeamRole.AREA_LEAD).build())).build());
        storageService.save(Team.builder().teamType(TeamType.IT).members(members(0)).build());
        storageService.save(Team.builder().productAreaId(productArea.getId()).teamType(TeamType.IT).members(members(1)).build());
        storageService.save(Team.builder().teamType(TeamType.IT).members(members(2)).build());
        storageService.save(Team.builder().teamType(TeamType.PRODUCT).members(members(9)).build());
        storageService.save(Team.builder().teamType(TeamType.IT).members(members(25)).clusterIds(List.of(cluster.getId())).build());

        ResponseEntity<DashResponse> resp = restTemplate.getForEntity("/dash", DashResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DashResponse dash = resp.getBody();
        assertThat(dash).isNotNull();

        assertThat(dash.getProductAreasCount()).isEqualTo(1);
        assertThat(dash.getProductAreas()).hasSize(1);
        assertThat(dash.getClusterCount()).isEqualTo(1);
        assertThat(dash.getClusters()).hasSize(1);
        assertThat(dash.getResources()).isEqualTo(3);
        assertThat(dash.getResourcesDb()).isEqualTo(3);

        var summary = dash.getTotal();

        assertThat(summary.getTeams()).isEqualTo(5);
        assertThat(summary.getTeamsEditedLastWeek()).isEqualTo(5);

        assertThat(summary.getTeamEmpty()).isEqualTo(1);
        assertThat(summary.getTeamUpTo5()).isEqualTo(2);
        assertThat(summary.getTeamUpTo10()).isEqualTo(1);
        assertThat(summary.getTeamUpTo20()).isEqualTo(0);
        assertThat(summary.getTeamOver20()).isEqualTo(1);

        assertThat(summary.getTeamExternal0p()).isEqualTo(1);
        assertThat(summary.getTeamExternalUpto25p()).isEqualTo(1);
        assertThat(summary.getTeamExternalUpto50p()).isEqualTo(1);
        assertThat(summary.getTeamExternalUpto75p()).isEqualTo(0);
        assertThat(summary.getTeamExternalUpto100p()).isEqualTo(2);

        assertThat(summary.getUniqueResources()).isEqualTo(25);
        assertThat(summary.getUniqueResourcesExternal()).isEqualTo(3);

        assertThat(summary.getRoles()).contains(new RoleCount(TeamRole.DEVELOPER, 37));
        assertThat(summary.getTeamTypes()).contains(new TeamTypeCount(TeamType.PRODUCT, 1), new TeamTypeCount(TeamType.IT, 4));
    }

    @Test
    void getDashboard2() {
        addNomResources(
                NomRessurs.builder().navident("a1").ressurstype(RESSURSTYPE_INTERN).build(), // Andreas
                NomRessurs.builder().navident("a2").ressurstype(RESSURSTYPE_INTERN).build(), // Ida
                NomRessurs.builder().navident("a3").ressurstype(RESSURSTYPE_INTERN).build(), // Erik
                NomRessurs.builder().navident("a4").ressurstype(RESSURSTYPE_EKSTERN).build(), // Mugge
                NomRessurs.builder().navident("a5").ressurstype(RESSURSTYPE_INTERN).build(), // Bent
                NomRessurs.builder().navident("a6").ressurstype(RESSURSTYPE_INTERN).build() // Trude
        );
        var productArea = storageService.save(ProductArea.builder()
                .members(List.of(
                        PaMember.builder().navIdent("a1").build()
                ))
                .build());

        storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a1").build(),
                        TeamMember.builder().navIdent("a3").build(),
                        TeamMember.builder().navIdent("a4").build()
                ))
                .build());

        var cluster = storageService
                .save(Cluster.builder()
                        .productAreaId(productArea.getId())
                        .members(List.of(
                                ClusterMember.builder().navIdent("a5").build(),
                                ClusterMember.builder().navIdent("a4").build()
                        )).build());

        var temp = storageService.save(Team.builder()
                .name(("Andreas 2"))
                .clusterIds(List.of(cluster.getId()))
                .teamType(TeamType.IT).members(List.of(
                TeamMember.builder().navIdent("a3").build(),
                TeamMember.builder().navIdent("a6").build()
        )).build());


        // team ida
        var team = storageService.save(Team.builder()
                .name("Ida")
                .productAreaId(productArea.getId())
                .teamType(TeamType.IT)
                .clusterIds(List.of(cluster.getId()))
                .members(List.of(
                        TeamMember.builder().navIdent("a2").build(),
                        TeamMember.builder().navIdent("a4").build()
                )).build());



        ResponseEntity<DashResponse> resp = restTemplate.getForEntity("/dash", DashResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DashResponse dash = resp.getBody();
        assertThat(dash).isNotNull();


        var productAreaSummary = dash.getAreaSummaryMap().get(productArea.getId());
        var clusterSummary = dash.getClusterSummaryMap().get(cluster.getId());
        var teamSummary2 = dash.getTeamSummaryMap().get(team.getId());


        assertThat(productAreaSummary.getMembershipCount()).isEqualTo(8);
        assertThat(productAreaSummary.getTotalTeamCount()).isEqualTo(3);
        assertThat(productAreaSummary.getUniqueResourcesCount()).isEqualTo(5);
        assertThat(productAreaSummary.getUniqueResourcesExternal()).isEqualTo(1);


        assertThat(clusterSummary.getTeamCount()).isEqualTo(2);
        assertThat(clusterSummary.getTotalMembershipCount()).isEqualTo(6);
        assertThat(clusterSummary.getTotalUniqueResourcesCount()).isEqualTo(5);
        assertThat(clusterSummary.getUniqueResourcesExternal()).isEqualTo(1);


        assertThat(teamSummary2.getMembershipCount()).isEqualTo(2);
        assertThat(teamSummary2.getResourcesExternal()).isEqualTo(1);


    }


        private List<TeamMember> members(int n) {
        return IntStream.range(1, n + 1)
                .mapToObj(ident -> TeamMember.builder().navIdent("a" + ident).roles(List.of(TeamRole.DEVELOPER)).build())
                .collect(Collectors.toList());
    }

    @Test
    void getDashboard3(){
        var productArea = storageService.save(ProductArea.builder().build());

        addNomResources(
                NomRessurs.builder().navident("a1").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a2").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a3").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a4").ressurstype(RESSURSTYPE_EKSTERN).build(),
                NomRessurs.builder().navident("a5").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a6").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a7").ressurstype(RESSURSTYPE_INTERN).build()
        );

        val team1 = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a1").build(),
                        TeamMember.builder().navIdent("a3").build(),
                        TeamMember.builder().navIdent("a4").build()
                ))
                        .officeHours(OfficeHours.builder()
                                .locationCode("FA1-BB-E2").build())
                .build());

        val team2 = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a1").build(),
                        TeamMember.builder().navIdent("a2").build(),
                        TeamMember.builder().navIdent("a5").build(),
                        TeamMember.builder().navIdent("a6").build()
                ))
                .officeHours(OfficeHours.builder()
                        .locationCode("FA1-BB-E4").build())
                .build());

        val team3 = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a3").build()
                ))
                .officeHours(OfficeHours.builder()
                        .locationCode("FA1-BB-E4").build())
                .build());

        val team4 = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a7").build()
                ))
                .officeHours(OfficeHours.builder()
                        .locationCode("FA1-BA-E4").build())

                .build());

        val teamNoLoc = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a7").build()
                ))
                .build());

        ResponseEntity<DashResponse> resp = restTemplate.getForEntity("/dash", DashResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);

        val bodyLocdata = resp.getBody().getLocationSummaryMap();
        val actualLocFloor2 = bodyLocdata.get("FA1-BB-E2");
        val actualLocFloor4 = bodyLocdata.get("FA1-BB-E4");
        val actualLocSection = bodyLocdata.get("FA1-BB");
        val actualLocBuilding = bodyLocdata.get("FA1");

        assertThat(actualLocFloor2.getTeamCount()).isEqualTo(1);
        assertThat(actualLocFloor2.getResourceCount()).isEqualTo(3);

        assertThat(actualLocFloor4.getTeamCount()).isEqualTo(2);
        assertThat(actualLocFloor4.getResourceCount()).isEqualTo(5);

        assertThat(actualLocSection.getTeamCount()).isEqualTo(3);
        assertThat(actualLocSection.getResourceCount()).isEqualTo(6);

        assertThat(actualLocBuilding.getTeamCount()).isEqualTo(4);
        assertThat(actualLocBuilding.getResourceCount()).isEqualTo(7);


    }

    @Test
    void locationOccupancyByDay() {
        var productArea = storageService.save(ProductArea.builder().build());

        addNomResources(
                NomRessurs.builder().navident("a1").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a2").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a3").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a4").ressurstype(RESSURSTYPE_EKSTERN).build(),
                NomRessurs.builder().navident("a5").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a6").ressurstype(RESSURSTYPE_INTERN).build(),
                NomRessurs.builder().navident("a7").ressurstype(RESSURSTYPE_INTERN).build()
        );

        val teamMondayTuesday = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a1").build(),
                        TeamMember.builder().navIdent("a3").build()
                ))
                .officeHours(OfficeHours.builder()
                        .locationCode("FA1-BB-E2")
                        .days(List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY))
                        .build())
                .build());

        val teamTuesdayWednesday = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a1").build(),
                        TeamMember.builder().navIdent("a2").build(),
                        TeamMember.builder().navIdent("a4").build(),
                        TeamMember.builder().navIdent("a5").build()

                ))
                .officeHours(OfficeHours.builder()
                        .locationCode("FA1-BB-E2")
                        .days(List.of(DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY))
                        .build())
                .build());

        val teamMondayOtherFloor = storageService.save(Team.builder()
                .productAreaId(productArea.getId()).teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent("a7").build()
                ))
                .officeHours(OfficeHours.builder()
                        .locationCode("FA1-BB-E3")
                        .days(List.of(DayOfWeek.MONDAY))
                        .build())
                .build());

        ResponseEntity<DashResponse> resp = restTemplate.getForEntity("/dash", DashResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        val locationSummaryFA1BBE2 = resp.getBody().getLocationSummaryMap().get("FA1-BB-E2");
        assertThat(locationSummaryFA1BBE2).isNotNull();
        val monday = locationSummaryFA1BBE2.getMonday();
        val tuesday = locationSummaryFA1BBE2.getTuesday();
        val wednesday = locationSummaryFA1BBE2.getWednesday();

        assertThat(locationSummaryFA1BBE2.getTeamCount()).isEqualTo(2);

        assertThat(monday.getTeamCount()).isEqualTo(1);
        assertThat(monday.getResourceCount()).isEqualTo(2);

        assertThat(tuesday.getTeamCount()).isEqualTo(2);
        assertThat(tuesday.getResourceCount()).isEqualTo(5);

        assertThat(wednesday.getTeamCount()).isEqualTo(1);
        assertThat(wednesday.getResourceCount()).isEqualTo(4);

        var locationSummaryFA1BB = resp.getBody().getLocationSummaryMap().get("FA1-BB");
        val mondayBuilding = locationSummaryFA1BB.getMonday();
        assertThat(mondayBuilding.getResourceCount()).isEqualTo(3);
        assertThat(mondayBuilding.getTeamCount()).isEqualTo(2);

    }



}