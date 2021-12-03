package no.nav.data.team.dashboard;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.domain.ClusterMember;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.dashboard.dto.DashResponse.RoleCount;
import no.nav.data.team.dashboard.dto.DashResponse.TeamTypeCount;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class DashboardControllerIT extends IntegrationTestBase {

    public static final String RESSURSTYPE = "EKSTERN";

    @Test
    void getDashboard() {
        addNomResources(
                NomRessurs.builder().navident("a1").ressurstype(RESSURSTYPE).build(),
                NomRessurs.builder().navident("a2").ressurstype(RESSURSTYPE).build(),
                NomRessurs.builder().navident("a3").ressurstype(RESSURSTYPE).build()
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
                NomRessurs.builder().navident("a1").ressurstype(RESSURSTYPE).build(), // Andreas
                NomRessurs.builder().navident("a2").ressurstype(RESSURSTYPE).build(), // Ida
                NomRessurs.builder().navident("a3").ressurstype(RESSURSTYPE).build(), // Erik
                NomRessurs.builder().navident("a4").ressurstype(RESSURSTYPE).build(), // Mugge
                NomRessurs.builder().navident("a5").ressurstype(RESSURSTYPE).build(), // Bent
                NomRessurs.builder().navident("a6").ressurstype(RESSURSTYPE).build() // Trude
        );
        var productArea = storageService.save(ProductArea.builder()
                .members(List.of(
                        PaMember.builder().navIdent("a1").build()
                ))
                .build());

        // team andreas
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


        // Team Andreas 2
        storageService.save(Team.builder()
                .clusterIds(List.of(cluster.getId()))
                .teamType(TeamType.IT).members(List.of(
                TeamMember.builder().navIdent("a3").build(),
                TeamMember.builder().navIdent("a6").build()
        )).build());


        // team ida
        storageService.save(Team.builder()
                .productAreaId(productArea.getId())
                .teamType(TeamType.IT)
                .clusterIds(List.of(cluster.getId()))
                .members(List.of(TeamMember.builder().navIdent("a2").build())).build());



        ResponseEntity<DashResponse> resp = restTemplate.getForEntity("/dash", DashResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DashResponse dash = resp.getBody();
        assertThat(dash).isNotNull();


//        var productAreaSummary = dash.getProductAreas().stream()
//                .filter(it -> it.getProductAreaId().equals(productArea.getId()))
//                .findFirst().get();
//
//
//
//        assertThat(productAreaSummary.getTotalResources()).isEqualTo(9);
//        assertThat((productAreaSummary.getTeams())).isEqualTo(3);
//        assertThat(productAreaSummary.getUniqueResources()).isEqualTo(6);

        var productAreaSummary = dash.getAreaSummaryMap().get(productArea.getId());

        assertThat(productAreaSummary.getMembershipCount()).isEqualTo(10);
        assertThat(productAreaSummary.getTotalTeamCount()).isEqualTo(3);
        assertThat(productAreaSummary.getUniqueResourcesCount()).isEqualTo(6);

    }


        private List<TeamMember> members(int n) {
        return IntStream.range(1, n + 1)
                .mapToObj(ident -> TeamMember.builder().navIdent("a" + ident).roles(List.of(TeamRole.DEVELOPER)).build())
                .collect(Collectors.toList());
    }
}