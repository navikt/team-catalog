package no.nav.data.team.team;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.team.TeamController.TeamPageResponse;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamMemberResponse;
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

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static no.nav.data.team.common.utils.StreamUtils.convert;
import static org.assertj.core.api.Assertions.assertThat;

public class TeamControllerIT extends IntegrationTestBase {

    private ProductArea productArea;

    @BeforeEach
    void setUp() {
        productArea = storageService.save(ProductArea.builder().name("po-name").build());
        addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(0)));
        addNomResource(TestDataHelper.createResource("Fam2", "Giv2", createNavIdent(1)));
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
    void getAllTeamsByProductArea() {
        storageService.save(Team.builder().name("name1").productAreaId(productArea.getId().toString()).build());
        storageService.save(Team.builder().name("name2").productAreaId(productArea.getId().toString()).build());
        storageService.save(Team.builder().name("name3").build());
        ResponseEntity<TeamPageResponse> resp = restTemplate.getForEntity("/team?productAreaId={paId}", TeamPageResponse.class, productArea
                .getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(2L);
        assertThat(convert(resp.getBody().getContent(), TeamResponse::getName)).contains("name1", "name2");
    }

    @Test
    void createTeam() {
        TeamRequest teamRequest = createTeamRequest();
        ResponseEntity<TeamResponse> resp = restTemplate.postForEntity("/team", teamRequest, TeamResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getId()).isNotNull();
        assertThat(resp.getBody()).isEqualTo(TeamResponse.builder()
                .id(resp.getBody().getId())
                .name("name")
                .description("desc")
                .slackChannel("#channel")
                .teamLeader(createNavIdent(0))
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .productAreaId(productArea.getId().toString())
                .members(List.of(TeamMemberResponse.builder()
                        .navIdent(createNavIdent(0))
                        .name("Giv Fam")
                        .role("role1")
                        .email("a@b.no")
                        .resourceType(ResourceType.EXTERNAL)
                        .build(), TeamMemberResponse.builder()
                        .navIdent(createNavIdent(1))
                        .name("Giv2 Fam2")
                        .role("role2")
                        .email("a@b.no")
                        .resourceType(ResourceType.EXTERNAL)
                        .build()))
                .build());
    }

    @Test
    void createTeamAddLeaderIfMissing() {
        TeamRequest teamRequest = createTeamRequest();
        teamRequest.setMembers(teamRequest.getMembers().subList(1, 2));
        ResponseEntity<TeamResponse> resp = restTemplate.postForEntity("/team", teamRequest, TeamResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        var leader = StreamUtils.find(resp.getBody().getMembers(), members -> members.getNavIdent().equals(createNavIdent(0)));
        assertThat(leader.getRole()).isEqualTo("Team Leader");
    }

    @Test
    void createTeamFail_ProductAreaDoesNotExist() {
        TeamRequest teamRequest = createTeamRequest();
        teamRequest.setProductAreaId("52e1f875-0262-45e0-bfcd-8f484413cb70");
        ResponseEntity<String> resp = restTemplate.postForEntity("/team", teamRequest, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("productAreaId -- doesNotExist");
    }

    @Test
    void createTeamFail_NaisTeamDoesNotExist() {
        TeamRequest teamRequest = createTeamRequest();
        teamRequest.setNaisTeams(List.of("nais-team-1", "bogus-team"));
        ResponseEntity<String> resp = restTemplate.postForEntity("/team", teamRequest, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("naisTeams -- doesNotExist");
    }

    @Test
    void createTeamFail_InvalidNavIdent() {
        TeamRequest teamRequest = createTeamRequest();
        teamRequest.getMembers().get(0).setNavIdent("123456");
        ResponseEntity<String> resp = restTemplate.postForEntity("/team", teamRequest, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("members[0].navIdent -- fieldWrongFormat -- 123456 is not valid for pattern");
    }

    @Test
    void updateTeam() {
        var teamRequest = createTeamRequestForUpdate();

        teamRequest.setName("newname");
        teamRequest.getMembers().get(0).setNavIdent("S654321");
        ResponseEntity<TeamResponse> resp = restTemplate.exchange("/team/{id}", HttpMethod.PUT, new HttpEntity<>(teamRequest), TeamResponse.class, teamRequest.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo("newname");
        assertThat(resp.getBody().getMembers().get(0).getNavIdent()).isEqualTo("S654321");
    }

    @Test
    void updateTeam_dontRemoveMembersIfNull() {
        var teamRequest = createTeamRequestForUpdate();

        teamRequest.setName("newname");
        teamRequest.setMembers(null);
        ResponseEntity<TeamResponse> resp = restTemplate.exchange("/team/{id}", HttpMethod.PUT, new HttpEntity<>(teamRequest), TeamResponse.class, teamRequest.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo("newname");
        assertThat(resp.getBody().getMembers()).hasSize(2);
    }

    @Test
    void updateTeam_OkIfNaisTeamCantBeFoundIfNotChanged() {
        var teamRequest = createTeamRequestForUpdate();

        String teamOne = "team-not-found-but-is-already-saved";
        Team team = storageService.get(teamRequest.getIdAsUUID(), Team.class);
        team.setNaisTeams(List.of(teamOne));
        storageService.save(team);

        teamRequest.setNaisTeams(List.of(teamOne, "nais-team-2"));
        ResponseEntity<TeamResponse> resp = restTemplate.exchange("/team/{id}", HttpMethod.PUT, new HttpEntity<>(teamRequest), TeamResponse.class, teamRequest.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNaisTeams()).containsAll(teamRequest.getNaisTeams());
    }

    @Test
    void deleteTeam() {
        UUID id = storageService.save(defaultTeam()).getId();

        restTemplate.delete("/team/{id}", id);
        assertThat(storageService.exists(id, "Team")).isFalse();
    }

    private Team defaultTeam() {
        return Team.builder().name("name1").build();
    }

    private TeamRequest createTeamRequestForUpdate() {
        TeamRequest teamRequest = createTeamRequest();
        ResponseEntity<TeamResponse> createResp = restTemplate.postForEntity("/team", teamRequest, TeamResponse.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResp.getBody()).isNotNull();

        UUID id = createResp.getBody().getId();
        teamRequest.setId(id.toString());
        return teamRequest;
    }

    private TeamRequest createTeamRequest() {
        return TeamRequest.builder()
                .name("name")
                .description("desc")
                .slackChannel("#channel")
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .productAreaId(productArea.getId().toString())
                .teamLeader(createNavIdent(0))
                .members(List.of(TeamMemberRequest.builder()
                        .navIdent(createNavIdent(0))
                        .role("role1")
                        .build(), TeamMemberRequest.builder()
                        .navIdent(createNavIdent(1))
                        .role("role2")
                        .build()))
                .build();
    }
}
