package no.nav.data.team.dashboard;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.dashboard.dto.DashResponse.RoleCount;
import no.nav.data.team.dashboard.dto.DashResponse.TeamTypeCount;
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

    @Test
    void getDashboard() {
        addNomResource(
                NomRessurs.builder().navident("a1").ressurstype("EKSTERN").build(),
                NomRessurs.builder().navident("a2").ressurstype("EKSTERN").build()
        );
        storageService.save(Team.builder().teamType(TeamType.IT).members(members(0)).build());
        storageService.save(Team.builder().teamType(TeamType.IT).members(members(1)).build());
        storageService.save(Team.builder().teamType(TeamType.IT).members(members(2)).build());
        storageService.save(Team.builder().teamType(TeamType.PRODUCT).members(members(11)).build());
        storageService.save(Team.builder().teamType(TeamType.IT).members(members(25)).build());

        ResponseEntity<DashResponse> resp = restTemplate.getForEntity("/dash", DashResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DashResponse dash = resp.getBody();
        assertThat(dash).isNotNull();

        assertThat(dash.getTeams()).isEqualTo(5);
        assertThat(dash.getTeamsEditedLastWeek()).isEqualTo(5);

        assertThat(dash.getTeamEmpty()).isEqualTo(1);
        assertThat(dash.getTeamUpTo5()).isEqualTo(2);
        assertThat(dash.getTeamUpTo10()).isEqualTo(0);
        assertThat(dash.getTeamUpTo20()).isEqualTo(1);
        assertThat(dash.getTeamOver20()).isEqualTo(1);

        assertThat(dash.getTeamExternalUpto25p()).isEqualTo(4);
        assertThat(dash.getTeamExternalUpto50p()).isEqualTo(0);
        assertThat(dash.getTeamExternalUpto75p()).isEqualTo(0);
        assertThat(dash.getTeamExternalUpto100p()).isEqualTo(1);

        assertThat(dash.getUniqueResourcesInATeam()).isEqualTo(25);
        assertThat(dash.getUniqueResourcesInATeamExternal()).isEqualTo(2);
        assertThat(dash.getResources()).isEqualTo(2);

        assertThat(dash.getRoles()).contains(new RoleCount(TeamRole.DEVELOPER, 39));
        assertThat(dash.getTeamTypes()).contains(new TeamTypeCount(TeamType.PRODUCT, 1), new TeamTypeCount(TeamType.IT, 4));
    }

    private List<TeamMember> members(int n) {
        return IntStream.range(0, n)
                .mapToObj(ident -> TeamMember.builder().navIdent("a" + ident).roles(List.of(TeamRole.DEVELOPER)).build())
                .collect(Collectors.toList());
    }
}