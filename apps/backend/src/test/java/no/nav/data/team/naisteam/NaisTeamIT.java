package no.nav.data.team.naisteam;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.naisteam.NaisTeamController.TeamPage;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class NaisTeamIT extends IntegrationTestBase {

    @Test
    void getTeams() {
        var teams = restTestClient.get().uri("/naisteam")
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamPage.class)
                .returnResult()
                .getResponseBody();

        assertThat(teams).isNotNull();
        assertThat(teams.getContent()).hasSize(3);
        assertThat(teams.getContent().getFirst().slug()).isEqualTo("nais-team-1");
    }

    @Test
    void getTeam() {
        var team = restTestClient.get().uri("/naisteam/{teamId}", "nais-team-1")
                .exchange()
                .expectStatus().isOk()
                .expectBody(NaisTeam.class)
                .returnResult()
                .getResponseBody();

        assertThat(team).isNotNull();
        assertThat(team.slug()).isEqualTo("nais-team-1");
    }

    @Test
    void searchTeams() {
        var teams = restTestClient.get().uri("/naisteam/search/{name}", "team-1")
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamPage.class)
                .returnResult()
                .getResponseBody();

        assertThat(teams).isNotNull();
        assertThat(teams.getContent()).hasSize(1);
        assertThat(teams.getContent().getFirst().slug()).isEqualTo("nais-team-1");
    }
}
