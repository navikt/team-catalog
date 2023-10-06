package no.nav.data.team.naisteam;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.naisteam.NaisTeamController.TeamPage;
import no.nav.data.team.naisteam.dto.NaisTeam;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class NaisTeamIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getTeams() {
        ResponseEntity<TeamPage> teams = restTemplate.getForEntity("/naisteam", TeamPage.class);
        assertThat(teams.getBody()).isNotNull();
        assertThat(teams.getBody().getContent()).hasSize(3);
        assertThat(teams.getBody().getContent().get(0).getId()).isEqualTo("nais-team-1");
        assertThat(teams.getBody().getContent().get(0).getName()).isEqualTo("nais-team-1");
    }

    @Test
    void getTeam() {
        ResponseEntity<NaisTeam> team = restTemplate.getForEntity("/naisteam/{teamId}", NaisTeam.class, "nais-team-1");
        assertThat(team.getBody()).isNotNull();
        assertThat(team.getBody().getId()).isEqualTo("nais-team-1");
        assertThat(team.getBody().getName()).isEqualTo("nais-team-1");
    }

    @Test
    void searchTeams() {
        ResponseEntity<TeamPage> teams = restTemplate.getForEntity("/naisteam/search/{name}", TeamPage.class, "team-1");
        assertThat(teams.getBody()).isNotNull();
        assertThat(teams.getBody().getContent()).hasSize(1);
        assertThat(teams.getBody().getContent().get(0).getId()).isEqualTo("nais-team-1");
        assertThat(teams.getBody().getContent().get(0).getName()).isEqualTo("nais-team-1");
    }
}
