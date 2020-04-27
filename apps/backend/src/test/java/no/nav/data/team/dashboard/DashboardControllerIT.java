package no.nav.data.team.dashboard;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.dashboard.dto.DashResponse;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
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
        nomClient.add(List.of(Resource.builder().navIdent("a1").build(), Resource.builder().navIdent("a2").build()));
        storageService.save(Team.builder().members(members(0)).build());
        storageService.save(Team.builder().members(members(1)).build());
        storageService.save(Team.builder().members(members(2)).build());
        storageService.save(Team.builder().members(members(11)).build());
        storageService.save(Team.builder().members(members(25)).build());

        ResponseEntity<DashResponse> resp = restTemplate.getForEntity("/dash", DashResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        DashResponse dash = resp.getBody();
        assertThat(dash).isNotNull();

        assertThat(dash.getTeams()).isEqualTo(6);
        assertThat(dash.getTeamsEditedLastWeek()).isEqualTo(6);

        assertThat(dash.getTeamEmpty()).isEqualTo(1);
        assertThat(dash.getTeamUpTo5()).isEqualTo(2);
        assertThat(dash.getTeamUpTo10()).isEqualTo(0);
        assertThat(dash.getTeamUpTo20()).isEqualTo(1);
        assertThat(dash.getTeamOver20()).isEqualTo(1);

        assertThat(dash.getUniqueResourcesInATeam()).isEqualTo(25);
        assertThat(dash.getResources()).isEqualTo(2);
        assertThat(dash.getRoles().get(0).getRole()).isEqualTo(TeamRole.DEVELOPER);
        assertThat(dash.getRoles().get(0).getCount()).isEqualTo(45);
    }

    private List<TeamMember> members(int n) {
        return IntStream.range(0, n)
                .mapToObj(ident -> TeamMember.builder().navIdent("a" + ident).roles(List.of(TeamRole.DEVELOPER)).build())
                .collect(Collectors.toList());
    }
}