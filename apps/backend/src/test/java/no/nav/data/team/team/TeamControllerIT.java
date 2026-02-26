package no.nav.data.team.team;

import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.rest.StandardResponse;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.contact.domain.Channel;
import no.nav.data.team.contact.domain.ContactAddress;
import no.nav.data.team.location.dto.LocationSimplePathResponse;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.shared.dto.Links.NamedLink;
import no.nav.data.team.team.domain.OfficeHours;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import no.nav.data.team.team.dto.OfficeHoursResponse;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

public class TeamControllerIT extends IntegrationTestBase {

    private ProductArea productArea;
    private Cluster cluster;

    private ResourceResponse resouceZero;
    private ResourceResponse resouceOne;

    private ResourceResponse teamOwnerOne;

    @BeforeEach
    void setUp() {
        productArea = storageService.save(ProductArea.builder().name("po-name").build());
        when(teamCatalogProps.getDefaultProductareaUuid()).thenReturn(productArea.getId().toString());

        cluster = storageService.save(Cluster.builder().name("cluster-name").build());
        resouceZero = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(0))).convertToResponse();
        resouceOne = addNomResource(TestDataHelper.createResource("Fam2", "Giv2", createNavIdent(1))).convertToResponse();
        teamOwnerOne = addNomResource(TestDataHelper.createResource("Fam3","Giv2",createNavIdent(2))).convertToResponse();
        addNomResource(TestDataHelper.createResource("Fam2", "Giv3", "S954321"));
    }

    @Test
    void getTeam() {
        var team = storageService.save(Team.builder().name("name").build());
        var resp = restTestClient.get().uri("/team/{id}", team.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo(team.getName());
    }

    @Test
    void searchTeam() {
        storageService.save(Team.builder().name("the name").build());
        var resp = restTestClient.get().uri("/team/search/{search}", "name")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void getAllTeams() {
        storageService.save(activeTeamBuilder("name1").build());
        storageService.save(activeTeamBuilder("name2").build());
        storageService.save(activeTeamBuilder("name3").status(DomainObjectStatus.INACTIVE).build());
        storageService.save(activeTeamBuilder("name4").status(DomainObjectStatus.PLANNED).build());

        var resp = restTestClient.get().uri("/team")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();

        var resp2 = restTestClient.get().uri("/team?status=ACTIVE,PLANNED,INACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp.getContent(), TeamResponse::getName)).contains("name1", "name2", "name3", "name4");


        assertThat(resp2).isNotNull();
        assertThat(resp2.getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp2.getContent(), TeamResponse::getName)).contains("name1", "name2", "name3", "name4");
    }

    @Test
    void getAllTeamsByStatus() {
        storageService.save(activeTeamBuilder("name1").build());
        storageService.save(activeTeamBuilder("name2").status(DomainObjectStatus.PLANNED).build());
        storageService.save(activeTeamBuilder("name3").status(DomainObjectStatus.INACTIVE).build());

        var resp = restTestClient.get().uri("/team?status=ACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/team?status=PLANNED")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();
        var resp3 = restTestClient.get().uri("/team?status=INACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();


        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp.getContent(), TeamResponse::getName)).contains("name1");

        assertThat(resp2).isNotNull();
        assertThat(resp2.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp2.getContent(), TeamResponse::getName)).contains("name2");

        assertThat(resp3).isNotNull();
        assertThat(resp3.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp3.getContent(), TeamResponse::getName)).contains("name3");
    }

    @Test
    void getAllTeamsInvalidStatusParameter(){
        storageService.save(activeTeamBuilder("name1").build());

        restTestClient.get().uri("/team?status=ACTIVE1")
                .exchange()
                .expectStatus().isBadRequest();
        restTestClient.get().uri("/team?status=ACTIVE,PLANNED,INACTIVE,EXTRA")
                .exchange()
                .expectStatus().isBadRequest();
    }




    @Test
    void getAllTeamsByProductArea() {
        storageService.save(Team.builder().name("name1").status(DomainObjectStatus.ACTIVE).productAreaId(productArea.getId()).build());
        storageService.save(Team.builder().name("name2").status(DomainObjectStatus.ACTIVE).productAreaId(productArea.getId()).build());
        storageService.save(Team.builder().name("name3").status(DomainObjectStatus.ACTIVE).build());
        var resp = restTestClient.get().uri("/team?productAreaId={paId}", productArea.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(2L);
        assertThat(convert(resp.getContent(), TeamResponse::getName)).contains("name1", "name2");
    }

    @Test
    void getAllTeamsByLocation(){
        storageService.save(Team.builder().status(DomainObjectStatus.ACTIVE).name("test1").officeHours(
                OfficeHours.builder()
                        .locationCode("FA1-BA-E1")
                        .build()
        ).build());

        storageService.save(Team.builder().status(DomainObjectStatus.ACTIVE).name("test2").officeHours(
                OfficeHours.builder()
                        .locationCode("FA1-BB-E1")
                        .build()
        ).build());

        var resp = restTestClient.get().uri("/team?locationCode=FA1-BA")
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp.getContent(), TeamResponse::getName)).contains("test1");
    }


    @Test
    void createTeam() {
        TeamRequest teamRequest = createTeamRequest();
        var responseBody = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus()
                .isCreated()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();


        assertThat(responseBody).isNotNull();
        assertThat(responseBody.getId()).isNotNull();
        assertThat(responseBody).isEqualTo(TeamResponse.builder()
                .id(responseBody.getId())
                .name("name")
                .description("desc")
                .slackChannel("#channel")
                .contactPersonIdent(createNavIdent(0))
                .contactAddresses(List.of(new ContactAddress("a@nav.no", Channel.EPOST)))
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .teamType(TeamType.UNKNOWN)
                .productAreaId(productArea.getId())
                .clusterIds(List.of(cluster.getId()))
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
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
                .links(Links.builder()
                        .ui("http://localhost:3000/team/" + responseBody.getId())
                        .slackChannels(List.of(new NamedLink("#channel", "https://slack.com/app_redirect?team=T5LNAMWNA&channel=channel")))
                        .build())
                .officeHours(OfficeHoursResponse.builder()
                                .location(LocationSimplePathResponse.convert(locationRepository.getLocationByCode("FA1-BA-E5").get()))
                                .days(List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY))
                                .information("Tilgjengelig fra 0800 til 1600")
                                .build()
                        )
                .build());
    }

    @Test
    void createTeams() {
        var teamRequest = List.of(createTeamRequest(), createTeamRequest());
        teamRequest.get(0).setName("name2");
        var resp = restTestClient.post().uri("/team/batch")
                .body(teamRequest)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<TeamResponse>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(2);
    }

    @Test
    void createTeamFail_ProductAreaDoesNotExist() {
        TeamRequest teamRequest = createTeamRequest();
        teamRequest.setProductAreaId("52e1f875-0262-45e0-bfcd-8f484413cb70");
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("ProductArea -- doesNotExist");
    }

    @Test
    void createTeamFail_NaisTeamDoesNotExist() {
        TeamRequest teamRequest = createTeamRequest();
        teamRequest.setNaisTeams(List.of("nais-team-1", "bogus-team"));
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("naisTeams -- doesNotExist");
    }

    @Test
    void createTeamFail_InvalidNavIdent() {
        TeamRequest teamRequest = createTeamRequest();
        teamRequest.getMembers().get(0).setNavIdent("123456");
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("members[0].navIdent -- fieldWrongFormat -- 123456 is not valid for pattern");
    }

    @Test
    void createTeamWithoutProductAreaId() {
        TeamRequest teamRequest = createTeamRequestNoProductAreaId();
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getProductAreaId().toString()).contains(this.teamCatalogProps.getDefaultProductareaUuid());
    }

    @Test
    void createTeam_withTeamOwnerInDefaultProductArea(){
        TeamRequest teamRequest = createDefaultTeamRequestBuilder()
                .teamOwnerIdent(teamOwnerOne.getNavIdent())
                .build();
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getTeamOwnerIdent()).isEqualTo(teamOwnerOne.getNavIdent());
    }

    @Test
    void createTeamFail_withTeamOwnerInNonDefaultProductArea(){
        var nonDefaultProductArea = storageService.save(ProductArea.builder().name("po-name").build());
        var teamRequest = createDefaultTeamRequestBuilder()
                .productAreaId(nonDefaultProductArea.getId().toString())
                .teamOwnerIdent(teamOwnerOne.getNavIdent())
                .build();
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("Cannot specify teamOwner for team in non-default product-area.");
    }

    @Test
    void createTeamFail_locationDoesNotExist(){
        TeamRequest teamRequest = createDefaultTeamRequestBuilder().officeHours(OfficeHours.builder().locationCode("INVALID").build()).build();
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("Location for given location code does not exist");
    }

    @Test
    void createTeamFail_locationNotFloor(){
        TeamRequest teamRequest = createDefaultTeamRequestBuilder().officeHours(OfficeHours.builder().locationCode("FA1-BA").build()).build();
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("Team location must be of type FLOOR");
    }

    @Test
    void createTeamFail_invalidDays(){
        TeamRequest teamRequest = createDefaultTeamRequestBuilder().officeHours(
                OfficeHours.builder()
                        .days(List.of(DayOfWeek.MONDAY, DayOfWeek.SUNDAY))
                        .locationCode("FA1-BA-E6")
                        .build()).build();
        var resp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("Officehours can't be on saturdays or sundays");
    }

    @Test
    void updateTeam() {
        var teamRequest = createTeamRequestForUpdate();

        teamRequest.setName("newname");
        teamRequest.getMembers().get(1).setNavIdent("S954321");
        teamRequest.getOfficeHours().setLocationCode("FA1-BC-E2");
        var resp = restTestClient.put().uri("/team/{id}", teamRequest.getId())
                .body(teamRequest)
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo("newname");
        assertThat(resp.getMembers().get(1).getNavIdent()).isEqualTo("S954321");
        assertThat(resp.getOfficeHours().getLocation()).isEqualTo(LocationSimplePathResponse.convert(locationRepository.getLocationByCode("FA1-BC-E2").get()));
    }

    @Test
    void updateTeam_dontRemoveMembersIfNull() {
        var teamRequest = createTeamRequestForUpdate();

        teamRequest.setName("newname");
        teamRequest.setMembers(null);
        var resp = restTestClient.put().uri("/team/{id}", teamRequest.getId())
                .body(teamRequest)
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo("newname");
        assertThat(resp.getMembers()).hasSize(2);
    }


    @Test
    void updateTeam_OkIfNaisTeamCantBeFoundIfNotChanged() {
        var teamRequest = createTeamRequestForUpdate();

        String teamOne = "team-not-found-but-is-already-saved";
        Team team = storageService.get(teamRequest.getIdAsUUID(), Team.class);
        team.setNaisTeams(List.of(teamOne));
        storageService.save(team);

        teamRequest.setNaisTeams(List.of(teamOne, "nais-team-2"));
        var resp = restTestClient.put().uri("/team/{id}", teamRequest.getId())
                .body(teamRequest)
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNaisTeams()).containsAll(teamRequest.getNaisTeams());
    }


    @Test
    void deleteTeam() {
        UUID id = storageService.save(defaultTeam()).getId();

        restTestClient.delete().uri("/team/{id}", id)
                .exchange()
                .expectStatus().isOk();
        assertThat(storageService.exists(id, "Team")).isFalse();
    }


    @Test
    void getTeamStatus() {
        var team1 = createTeamRequestWithStatus(DomainObjectStatus.ACTIVE, "team 1");
        var team2 = createTeamRequestWithStatus(DomainObjectStatus.INACTIVE, "team 2");
        var team3 = createTeamRequestWithStatus(DomainObjectStatus.PLANNED, "team 3");

        var post1 = restTestClient.post().uri("/team")
                .body(team1)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();
        var post2 = restTestClient.post().uri("/team")
                .body(team2)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();
        var post3 = restTestClient.post().uri("/team")
                .body(team3)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(post1).isNotNull();
        assertThat(post2).isNotNull();
        assertThat(post3).isNotNull();

        var resp1 = restTestClient.get().uri("/team/{id}", post1.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/team/{id}", post2.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();
        var resp3 = restTestClient.get().uri("/team/{id}", post3.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp1).isNotNull();
        assertThat(resp2).isNotNull();
        assertThat(resp3).isNotNull();

        assertThat(resp1.getStatus()).isEqualTo(DomainObjectStatus.ACTIVE);
        assertThat(resp2.getStatus()).isEqualTo(DomainObjectStatus.INACTIVE);
        assertThat(resp3.getStatus()).isEqualTo(DomainObjectStatus.PLANNED);
    }


    private Team defaultTeam() {
        return Team.builder().name("name1").build();
    }

    private Team.TeamBuilder activeTeamBuilder(String name) {
        return Team.builder().name(name).status(DomainObjectStatus.ACTIVE);
    }

    private TeamRequest createTeamRequestForUpdate() {
        TeamRequest teamRequest = createTeamRequest();
        var createResp = restTestClient.post().uri("/team")
                .body(teamRequest)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(TeamResponse.class)
                .returnResult()
                .getResponseBody();
        assertThat(createResp).isNotNull();

        UUID id = createResp.getId();
        teamRequest.setId(id.toString());
        return teamRequest;
    }

    private TeamRequest.TeamRequestBuilder createDefaultTeamRequestBuilder(){
        return TeamRequest.builder()
                .name("name")
                .description("desc")
                .slackChannel("#channel")
                .contactPersonIdent(createNavIdent(0))
                .contactAddresses(List.of(new ContactAddress("a@nav.no", Channel.EPOST)))
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .productAreaId(productArea.getId().toString())
                .clusterIds(List.of(cluster.getId().toString()))
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
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
                        .build()));
    }

    private TeamRequest createTeamRequest() {
        return TeamRequest.builder()
                .name("name")
                .description("desc")
                .slackChannel("#channel")
                .contactPersonIdent(createNavIdent(0))
                .contactAddresses(List.of(new ContactAddress("a@nav.no", Channel.EPOST)))
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .productAreaId(productArea.getId().toString())
                .clusterIds(List.of(cluster.getId().toString()))
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
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
                .officeHours(OfficeHours.builder()
                        .locationCode("FA1-BA-E5")
                        .days(List.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY))
                        .information("Tilgjengelig fra 0800 til 1600")
                        .build()
                )
                .build();
    }

    private TeamRequest createTeamRequestWithStatus(DomainObjectStatus status, String name)
    {
        return createDefaultTeamRequestBuilder()
                .name(name)
                .status(status)
                .build();
    }

    private TeamRequest createTeamRequestNoProductAreaId() {
        return TeamRequest.builder()
                .name("name2")
                .description("desc")
                .slackChannel("#channel")
                .contactPersonIdent(createNavIdent(0))
                .contactAddresses(List.of(new ContactAddress("a@nav.no", Channel.EPOST)))
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .productAreaId(null)
                .clusterIds(List.of(cluster.getId().toString()))
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
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
                .build();
    }

}
