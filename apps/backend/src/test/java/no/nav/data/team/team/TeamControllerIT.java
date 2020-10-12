package no.nav.data.team.team;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.team.TeamController.TeamPageResponse;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;

public class TeamControllerIT extends IntegrationTestBase {

    private ProductArea productArea;

    private ResourceResponse resouceZero;
    private ResourceResponse resouceOne;

    @BeforeEach
    void setUp() {
        productArea = storageService.save(ProductArea.builder().name("po-name").build());
        resouceZero = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(0))).convertToResponse();
        resouceOne = addNomResource(TestDataHelper.createResource("Fam2", "Giv2", createNavIdent(1))).convertToResponse();
        addNomResource(TestDataHelper.createResource("Fam2", "Giv3", "S654321"));
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
    void searchTeam() {
        storageService.save(Team.builder().name("the name").build());
        ResponseEntity<TeamPageResponse> resp = restTemplate.getForEntity("/team/search/{search}", TeamPageResponse.class, "name");

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(1);
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
        storageService.save(Team.builder().name("name1").productAreaId(productArea.getId()).build());
        storageService.save(Team.builder().name("name2").productAreaId(productArea.getId()).build());
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
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .teamType(TeamType.UNKNOWN)
                .productAreaId(productArea.getId())
                .tags(List.of("tag"))
                .members(List.of(MemberResponse.builder()
                                .navIdent(createNavIdent(0))
                                .roles(List.of(TeamRole.DEVELOPER))
                                .description("desc1")
                                .resource(resouceZero)
                                .teamPercent(50)
                                .startDate(LocalDate.now().minusDays(1))
                                .endDate(LocalDate.now().plusDays(1))
                                .build(),
                        MemberResponse.builder()
                                .navIdent(createNavIdent(1))
                                .description("desc2")
                                .roles(List.of(TeamRole.DEVELOPER))
                                .resource(resouceOne)
                                .build()))
                .locations(List.of(
                        Location.builder()
                                .floorId("fa1-a6")
                                .locationCode("A601")
                                .x(200)
                                .y(400)
                                .build()
                ))
                .build());
    }

    @Test
    void createTeams() {
        var teamRequest = List.of(createTeamRequest(), createTeamRequest());
        teamRequest.get(0).setName("name2");
        ResponseEntity<TeamPageResponse> resp = restTemplate.postForEntity("/team/batch", teamRequest, TeamPageResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(2);
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
        teamRequest.getMembers().get(1).setNavIdent("S654321");
        ResponseEntity<TeamResponse> resp = restTemplate.exchange("/team/{id}", HttpMethod.PUT, new HttpEntity<>(teamRequest), TeamResponse.class, teamRequest.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo("newname");
        assertThat(resp.getBody().getMembers().get(1).getNavIdent()).isEqualTo("S654321");
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
                .tags(List.of("tag"))
                .members(List.of(TeamMemberRequest.builder()
                        .navIdent(createNavIdent(0))
                        .roles(List.of(TeamRole.DEVELOPER))
                        .description("desc1")
                        .teamPercent(50)
                        .startDate(LocalDate.now().minusDays(1))
                        .endDate(LocalDate.now().plusDays(1))
                        .build(), TeamMemberRequest.builder()
                        .navIdent(createNavIdent(1))
                        .roles(List.of(TeamRole.DEVELOPER))
                        .description("desc2")
                        .build()))
                .locations(List.of(
                        Location.builder()
                                .floorId("fa1-a6")
                                .locationCode("A601")
                                .x(200)
                                .y(400)
                                .build()
                ))
                .build();
    }
}
