package no.nav.data.team.team;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class TeamControllerIT extends IntegrationTestBase {

    @Test
    void createTeam() {
        TeamRequest team = TeamRequest.builder()
                .name("name")
                .description("desc")
                .build();
        ResponseEntity<TeamResponse> resp = restTemplate.postForEntity("/team", team, TeamResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo(team.getName());
    }

    @Test
    void getTeam() {
        var team = storageService.save(Team.builder().name("name").build());
        ResponseEntity<TeamResponse> resp = restTemplate.getForEntity("/team/{id}", TeamResponse.class, team.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo(team.getName());
    }
}
