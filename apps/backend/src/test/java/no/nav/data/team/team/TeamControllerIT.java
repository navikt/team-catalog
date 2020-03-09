package no.nav.data.team.team;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.TeamController.TeamPageResponse;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.convert;
import static org.assertj.core.api.Assertions.assertThat;

public class TeamControllerIT extends IntegrationTestBase {

    private ProductArea po;

    @BeforeEach
    void setUp() {
        po = storageService.save(ProductArea.builder().name("po-name").build());
    }

    @Test
    void getTeam() {
        var team = storageService.save(Team.builder().name("name").build());
        ResponseEntity<TeamResponse> resp = restTemplate.getForEntity("/team/{id}", TeamResponse.class, team.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo(team.getName());
    }

    @Test
    void getAllTeams() {
        storageService.save(Team.builder().name("name1").build());
        storageService.save(Team.builder().name("name2").build());
        storageService.save(Team.builder().name("name3").build());
        ResponseEntity<TeamPageResponse> resp = restTemplate.getForEntity("/team", TeamPageResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(3L);
        assertThat(convert(resp.getBody().getContent(), TeamResponse::getName)).contains("name1", "name2", "name3");
    }

    @Test
    void createTeam() {
        TeamRequest team = createTeamRequest();
        ResponseEntity<TeamResponse> resp = restTemplate.postForEntity("/team", team, TeamResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getId()).isNotNull();
        assertThat(resp.getBody()).isEqualTo(TeamResponse.builder()
                .id(resp.getBody().getId())
                .name("name")
                .description("desc")
                .slackChannel("#channel")
                .naisTeams(List.of("team1", "team2"))
                .productAreaId(po.getId().toString())
                .build());
    }

    @Test
    void createTeamFail_ProductAreaDoesNotExist() {
        TeamRequest team = createTeamRequest();
        team.setProductAreaId("52e1f875-0262-45e0-bfcd-8f484413cb70");
        ResponseEntity<String> resp = restTemplate.postForEntity("/team", team, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("productAreaId -- doesNotExist");
    }

    @Test
    void updateTeam() {
        TeamRequest team = createTeamRequest();
        ResponseEntity<TeamResponse> createResp = restTemplate.postForEntity("/team", team, TeamResponse.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResp.getBody()).isNotNull();

        UUID id = createResp.getBody().getId();
        team.setId(id.toString());
        team.setName("newname");
        ResponseEntity<TeamResponse> resp = restTemplate.exchange("/team/{id}", HttpMethod.PUT, new HttpEntity<>(team), TeamResponse.class, id);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo("newname");
    }

    @Test
    void deleteTeam() {
        TeamRequest team = createTeamRequest();
        ResponseEntity<TeamResponse> createResp = restTemplate.postForEntity("/team", team, TeamResponse.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResp.getBody()).isNotNull();

        UUID id = createResp.getBody().getId();

        restTemplate.delete("/team/{id}", id);
        assertThat(storageService.exists(id, "Team")).isFalse();
    }

    private TeamRequest createTeamRequest() {
        return TeamRequest.builder()
                .name("name")
                .description("desc")
                .slackChannel("#channel")
                .naisTeams(List.of("team1", "team2"))
                .productAreaId(po.getId().toString())
                .build();
    }
}
