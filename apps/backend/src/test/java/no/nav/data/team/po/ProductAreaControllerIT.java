package no.nav.data.team.po;

import no.nav.data.common.rest.StandardResponse;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaController.ProductAreaPageResponse;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.*;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.nom.graphql.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ProductAreaControllerIT extends IntegrationTestBase {

    private ResourceResponse resouceZero;
    private ResourceResponse resouceOne;
    private ResourceResponse resouceTwo;

    @BeforeEach
    void setUp() {
        resouceZero = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(0))).convertToResponse();
        resouceOne = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(1))).convertToResponse();
        resouceTwo = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(2))).convertToResponse();
        when(orgService.isOrgEnhetInArbeidsomraadeOgDirektorat(any())).thenReturn(true);
    }

    @Test
    void getProductArea() {
        var productArea = storageService.save(ProductArea.builder().name("name").build());
        var resp = restTestClient.get().uri("/productarea/{id}", productArea.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo(productArea.getName());
    }

    @Test
    void getAllProductAreas() {
        storageService.save(activePoBuilder("name1").build());
        storageService.save(activePoBuilder("name2").build());
        storageService.save(activePoBuilder("name3").status(DomainObjectStatus.INACTIVE).build());
        storageService.save(activePoBuilder("name4").status(DomainObjectStatus.PLANNED).build());

        var resp = restTestClient.get().uri("/productarea")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaPageResponse.class)
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/productarea?status=ACTIVE,PLANNED,INACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaPageResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp.getContent(), ProductAreaResponse::getName)).contains("name1", "name2", "name3", "name4");

        assertThat(resp2).isNotNull();
        assertThat(resp2.getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp2.getContent(), ProductAreaResponse::getName)).contains("name1", "name2", "name3", "name4");
    }

    @Test
    void getAllProductAreasByStatus() {
        storageService.save(activePoBuilder("name1").build());
        storageService.save(activePoBuilder("name2").status(DomainObjectStatus.PLANNED).build());
        storageService.save(activePoBuilder("name3").status(DomainObjectStatus.INACTIVE).build());

        var resp = restTestClient.get().uri("/productarea?status=ACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaPageResponse.class)
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/productarea?status=PLANNED")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaPageResponse.class)
                .returnResult()
                .getResponseBody();
        var resp3 = restTestClient.get().uri("/productarea?status=INACTIVE")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaPageResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp.getContent(), ProductAreaResponse::getName)).contains("name1");

        assertThat(resp2).isNotNull();
        assertThat(resp2.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp2.getContent(), ProductAreaResponse::getName)).contains("name2");

        assertThat(resp3).isNotNull();
        assertThat(resp3.getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp3.getContent(), ProductAreaResponse::getName)).contains("name3");
    }

    @Test
    void getAllProductAreasInvalidStatusParameter() {
        storageService.save(activePoBuilder("name1").build());

        restTestClient.get().uri("/productarea?status=ACTIVE1")
                .exchange()
                .expectStatus().isBadRequest();
        restTestClient.get().uri("/productarea?status=ACTIVE,PLANNED,INACTIVE,EXTRA")
                .exchange()
                .expectStatus().isBadRequest();

    }

    @Test
    void searchProductArea() {
        storageService.save(ProductArea.builder().name("the name").build());
        var resp = restTestClient.get().uri("/productarea/search/{search}", "name")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaPageResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void createProductArea() {
        ProductAreaRequest productArea = createProductAreaRequest();
        var body = restTestClient.post().uri("/productarea")
                .body(productArea)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(body).isNotNull();
        assertThat(body.getId()).isNotNull();
        assertThat(body.getChangeStamp()).isNotNull();
        body.setChangeStamp(null);
        assertThat(body).isEqualTo(ProductAreaResponse.builder()
                .id(body.getId())
                .nomId("nomId")
                .name("name")
                .areaType(AreaType.PRODUCT_AREA)
                .description("desc")
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
                .members(List.of(MemberResponse.builder()
                        .navIdent(createNavIdent(0))
                        .description("desc")
                        .resource(resouceZero)
                        .roles(List.of(TeamRole.LEAD))
                        .build()))
                .paOwnerGroup(PaOwnerGroupResponse.builder()
                        .ownerResource(resouceOne)
                        .nomOwnerGroupMemberNavIdList(List.of())
                        .ownerGroupMemberResourceList(List.of(resouceTwo))
                        .build())
                .links(new Links("http://localhost:3000/area/" + body.getId()))
                .build());
    }

    @Test
    void createProductAreaFail_InvalidName() {
        ProductAreaRequest productArea = createProductAreaRequest();
        productArea.setName("");
        var resp = restTestClient.post().uri("/productarea")
                .body(productArea)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("name -- fieldIsNullOrMissing");
    }

    @Test
    void addTeamsToProductArea() {
        ProductAreaRequest productArea = createProductAreaRequest();
        var resp = restTestClient.post().uri("/productarea")
                .body(productArea)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        Team team1 = storageService.save(Team.builder().name("abc").build());
        Team team2 = storageService.save(Team.builder().name("def").build());

        var productAreaId = resp.getId();
        var addTeamsRequest = AddTeamsToProductAreaRequest.builder()
                .productAreaId(productAreaId.toString())
                .teamIds(List.of(team1.getId().toString(), team2.getId().toString()))
                .build();
        restTestClient.post().uri("/productarea/addteams")
                .body(addTeamsRequest)
                .exchange()
                .expectStatus().isOk();
        assertThat(storageService.get(team1.getId(), Team.class).getProductAreaId()).isEqualTo(productAreaId);
        assertThat(storageService.get(team2.getId(), Team.class).getProductAreaId()).isEqualTo(productAreaId);
    }

    @Test
    void addTeamsToProductArea_TeamDoesntExist() {
        ProductAreaRequest productArea = createProductAreaRequest();
        var resp = restTestClient.post().uri("/productarea")
                .body(productArea)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();

        String productAreaId = resp.getId().toString();
        var addTeamsRequest = AddTeamsToProductAreaRequest.builder()
                .productAreaId(productAreaId)
                .teamIds(List.of("83daedcd-f563-4e3f-85b3-c0553fce742d"))

                .build();
        restTestClient.post().uri("/productarea/addteams")
                .body(addTeamsRequest)
                .exchange()
                .expectStatus().isBadRequest();
    }

    @Test
    void updateProductArea() {
        ProductAreaRequest productArea = createProductAreaRequest();
        var createResp = restTestClient.post().uri("/productarea")
                .body(productArea)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();
        assertThat(createResp).isNotNull();

        UUID id = createResp.getId();
        productArea.setId(id.toString());
        productArea.setName("newname");
        var resp = restTestClient.put().uri("/productarea/{id}", id)
                .body(productArea)
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo("newname");
    }

    @Test
    void deleteProductArea() {
        var productArea = storageService.save(ProductArea.builder().name("name").build());
        restTestClient.delete().uri("/productarea/{id}", productArea.getId())
                .exchange()
                .expectStatus().isOk();
        assertThat(storageService.exists(productArea.getId(), "ProductArea")).isFalse();
    }

    @Test
    void deleteProductAreaFail_PoHasTeams() {
        var productArea = storageService.save(ProductArea.builder().name("name").build());
        storageService.save(Team.builder().productAreaId(productArea.getId()).build());

        restTestClient.delete().uri("/productarea/{id}", productArea.getId())
                .exchange()
                .expectStatus().isBadRequest();
        assertThat(storageService.exists(productArea.getId(), "ProductArea")).isTrue();
    }

    @Test
    void createProductAreaFailWithErroneousOwnerGroupLackingLeader() {
        var reqBuilder = productAreaRequestBuilderTemplate();
        addIllegalOwnerGroupNoLeader(reqBuilder);
        var req = reqBuilder.build();
        var resp = restTestClient.post().uri("/productarea")
                .body(req)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("ownerGroupMemberNavIdList -- paOwnerGroupError");
    }

    @Test
    void createProductAreaFailWithErroneousOwnerAndOwnerGroupIds() {
        var reqBuilder = productAreaRequestBuilderTemplate();
        addIllegalOwnerGroupBadIds(reqBuilder);
        var req = reqBuilder.build();
        var resp = restTestClient.post().uri("/productarea")
                .body(req)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("ownerGroupMemberNavIdList -- paOwnerGroupError");
    }

    @Test
    void createProductAreaFailWithDuplicatesInOwnergroup() {
        var reqBuilder = productAreaRequestBuilderTemplate();
        addIllegalOwnerGroupDuplicates(reqBuilder);
        var req = reqBuilder.build();
        var resp = restTestClient.post().uri("/productarea")
                .body(req)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(StandardResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getMessage()).contains("ownerGroupMemberNavIdList -- paOwnerGroupError");
    }

    @Test
    void createProductAreaWithNoOwnerOrOwnerGroup() {
        var req = productAreaRequestBuilderTemplate()
                .ownerGroup(null).build();
        restTestClient.post().uri("/productarea")
                .body(req)
                .exchange()
                .expectStatus().isCreated();
    }

    @Test
    void getDefaultArea_checkDefaultProductAreaFlag(){
        ProductArea defaultArea = storageService.save(ProductArea.builder().name("default").areaType(AreaType.OTHER).build());
        when(teamCatalogProps.getDefaultProductareaUuid()).thenReturn(defaultArea.getId().toString());

        var resp = restTestClient.get().uri("/productarea/{id}", defaultArea.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.isDefaultArea()).isTrue();
    }

    @Test
    void getNonDefaultArea_checkNotDefaultProductAreaFlag(){
        ProductArea defaultArea = storageService.save(ProductArea.builder().name("default").areaType(AreaType.OTHER).build());
        ProductArea testArea = storageService.save(ProductArea.builder().name("non-default").areaType(AreaType.OTHER).build());
        when(teamCatalogProps.getDefaultProductareaUuid()).thenReturn(defaultArea.getId().toString());

        var resp = restTestClient.get().uri("/productarea/{id}", testArea.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.isDefaultArea()).isFalse();
    }

    @Test
    void getProductAreaStatus() {
        var po1 = createProductAreaRequestWithStatus(DomainObjectStatus.ACTIVE, "po 1");
        var po2 = createProductAreaRequestWithStatus(DomainObjectStatus.INACTIVE, "po 2");
        var po3 = createProductAreaRequestWithStatus(DomainObjectStatus.PLANNED, "po 3");

        var post1 = restTestClient.post().uri("/productarea")
                .body(po1)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();
        var post2 = restTestClient.post().uri("/productarea")
                .body(po2)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();
        var post3 = restTestClient.post().uri("/productarea")
                .body(po3)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(post1).isNotNull();
        assertThat(post2).isNotNull();
        assertThat(post3).isNotNull();

        var resp1 = restTestClient.get().uri("/productarea/{id}", post1.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();
        var resp2 = restTestClient.get().uri("/productarea/{id}", post2.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();
        var resp3 = restTestClient.get().uri("/productarea/{id}", post3.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp1).isNotNull();
        assertThat(resp2).isNotNull();
        assertThat(resp3).isNotNull();

        assertThat(resp1.getStatus()).isEqualTo(DomainObjectStatus.ACTIVE);
        assertThat(resp2.getStatus()).isEqualTo(DomainObjectStatus.INACTIVE);
        assertThat(resp3.getStatus()).isEqualTo(DomainObjectStatus.PLANNED);
    }

    @Test
    void setProductAreaOwnerGroups() {
        var orgenhetDto = createOrgEnhetDto();
        var lederNavident = orgenhetDto.getLedere().getFirst().getRessurs().getNavident();
        var nomLederGruppeNavident = orgenhetDto.getOrganiseringer().getFirst().getOrgEnhet().getLedere().getFirst().getRessurs().getNavident();
        ProductAreaRequest productArea = createProductAreaRequest();
        productArea.setOwnerGroup(new PaOwnerGroupRequest(resouceOne.getNavIdent(), Map.of(resouceTwo.getNavIdent(), List.of(orgenhetDto.getNavn())), List.of(resouceTwo.getNavIdent()), List.of(resouceZero.getNavIdent(), nomLederGruppeNavident)));
        when(orgService.getOrgEnhetOgUnderEnheter(productArea.getNomId())).thenReturn(orgenhetDto);
        when(orgService.isOrgEnhetInArbeidsomraadeOgDirektorat("nomId")).thenReturn(true);
        var resp = restTestClient.post().uri("/productarea")
                .body(productArea)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductAreaResponse.class)
                .returnResult()
                .getResponseBody();

        assertThat(resp).isNotNull();
        assertThat(resp.getPaOwnerGroup().getOwnerResource().getNavIdent()).isEqualTo(lederNavident);
        assertThat(resp.getPaOwnerGroup().getNomOwnerGroupMemberNavIdList().getFirst().getNavIdent()).isEqualTo(nomLederGruppeNavident);
        assertThat(resp.getPaOwnerGroup().getOwnerGroupMemberResourceList().getFirst().getNavIdent()).isEqualTo(resouceZero.getNavIdent());
    }

    private ProductAreaRequest createProductAreaRequest() {
        return productAreaRequestBuilderTemplate()
                .build();
    }

    private ProductArea.ProductAreaBuilder activePoBuilder(String name) {
        return ProductArea.builder().name(name).status(DomainObjectStatus.ACTIVE);
    }

    private ProductAreaRequest createProductAreaRequestWithStatus(DomainObjectStatus status, String name) {
        return productAreaRequestBuilderTemplate()
                .name(name)
                .status(status)
                .build();
    }

    private ProductAreaRequest.ProductAreaRequestBuilder productAreaRequestBuilderTemplate() {
        return ProductAreaRequest.builder()
                .name("name")
                .nomId("nomId")
                .areaType(AreaType.PRODUCT_AREA)
                .description("desc")
                .tags(List.of("tag"))
                .status(DomainObjectStatus.ACTIVE)
                .members(List.of(PaMemberRequest.builder()
                        .navIdent(createNavIdent(0)).description("desc").roles(List.of(TeamRole.LEAD)).build()))
                .ownerGroup(PaOwnerGroupRequest.builder()
                        .ownerNavId(resouceOne.getNavIdent())
                        .nomOwnerGroupMemberNavIdList(new ArrayList<>())
                        .ownerGroupMemberNavIdList(List.of(resouceTwo.getNavIdent())).build());
    }



    private void addIllegalOwnerGroupNoLeader(ProductAreaRequest.ProductAreaRequestBuilder builder) {
        builder.ownerGroup(PaOwnerGroupRequest.builder()
                .ownerNavId(null)
                .nomOwnerGroupMemberNavIdList(List.of())
                .ownerGroupMemberNavIdList(List.of(resouceTwo.getNavIdent()))
                .build()
        );
    }

    private void addIllegalOwnerGroupDuplicates(ProductAreaRequest.ProductAreaRequestBuilder builder) {
        builder.ownerGroup(PaOwnerGroupRequest.builder()
                .nomOwnerGroupMemberNavIdList(List.of())
                .ownerNavId(resouceOne.getNavIdent())
                .ownerGroupMemberNavIdList(List.of(resouceOne.getNavIdent(), resouceOne.getNavIdent(), resouceTwo.getNavIdent())).build());
    }

    private void addIllegalOwnerGroupBadIds(ProductAreaRequest.ProductAreaRequestBuilder builder) {
        builder.ownerGroup(PaOwnerGroupRequest.builder()
                .ownerNavId("faultyId1")
                .nomOwnerGroupMemberNavIdList(List.of())
                .ownerGroupMemberNavIdList(List.of("faultyId2", "faultyId3")).build());
    }

    private OrgEnhetDto createOrgEnhetDto() {
        return OrgEnhetDto.builder()
                .setId("orgEnhet-123")
                .setNavn("Org Enhet 123")
                .setOrgEnhetsType(OrgEnhetsTypeDto.DIREKTORAT)
                .setNomNivaa(NomNivaaDto.ARBEIDSOMRAADE)
                .setLedere(List.of(OrgEnhetsLederDto.builder()
                        .setRessurs(RessursDto.builder()
                                .setFornavn("Nav")
                                .setEtternavn("Navesen")
                                .setVisningsnavn("Nav Navesen")
                                .setNavident("N123456").build()).build()))
                .setOrganiseringer(List.of(OrganiseringDto.builder()
                        .setOrgEnhet(OrgEnhetDto.builder()
                                .setId("orgEnhet-456")
                                .setLedere(List.of(OrgEnhetsLederDto.builder()
                                        .setRessurs(RessursDto.builder()
                                                .setFornavn("Team")
                                                .setEtternavn("Leader")
                                                .setVisningsnavn("Team Leader")
                                                .setNavident("T123456").build()).build()))
                                .build())
                        .build()))
                .build();
    }

}
