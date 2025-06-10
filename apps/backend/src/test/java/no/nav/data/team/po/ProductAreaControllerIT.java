package no.nav.data.team.po;

import com.fasterxml.jackson.databind.node.ObjectNode;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaController.ProductAreaPageResponse;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.AddTeamsToProductAreaRequest;
import no.nav.data.team.po.dto.PaMemberRequest;
import no.nav.data.team.po.dto.PaOwnerGroupRequest;
import no.nav.data.team.po.dto.PaOwnerGroupResponse;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.nom.graphql.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
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
        ResponseEntity<ProductAreaResponse> resp = restTemplate.getForEntity("/productarea/{id}", ProductAreaResponse.class, productArea.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo(productArea.getName());
    }

    @Test
    void getAllProductAreas() {
        storageService.save(activePoBuilder("name1").build());
        storageService.save(activePoBuilder("name2").build());
        storageService.save(activePoBuilder("name3").status(DomainObjectStatus.INACTIVE).build());
        storageService.save(activePoBuilder("name4").status(DomainObjectStatus.PLANNED).build());

        ResponseEntity<ProductAreaPageResponse> resp = restTemplate.getForEntity("/productarea", ProductAreaPageResponse.class);
        ResponseEntity<ProductAreaPageResponse> resp2 = restTemplate.getForEntity("/productarea?status=ACTIVE,PLANNED,INACTIVE", ProductAreaPageResponse.class);


        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp.getBody().getContent(), ProductAreaResponse::getName)).contains("name1", "name2", "name3", "name4");

        assertThat(resp2.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp2.getBody()).isNotNull();
        assertThat(resp2.getBody().getNumberOfElements()).isEqualTo(4L);
        assertThat(convert(resp2.getBody().getContent(), ProductAreaResponse::getName)).contains("name1", "name2", "name3", "name4");
    }

    @Test
    void getAllProductAreasByStatus() {
        storageService.save(activePoBuilder("name1").build());
        storageService.save(activePoBuilder("name2").status(DomainObjectStatus.PLANNED).build());
        storageService.save(activePoBuilder("name3").status(DomainObjectStatus.INACTIVE).build());


        ResponseEntity<ProductAreaPageResponse> resp = restTemplate.getForEntity("/productarea?status=ACTIVE", ProductAreaPageResponse.class);
        ResponseEntity<ProductAreaPageResponse> resp2 = restTemplate.getForEntity("/productarea?status=PLANNED", ProductAreaPageResponse.class);
        ResponseEntity<ProductAreaPageResponse> resp3 = restTemplate.getForEntity("/productarea?status=INACTIVE", ProductAreaPageResponse.class);


        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp.getBody().getContent(), ProductAreaResponse::getName)).contains("name1");

        assertThat(resp2.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp2.getBody()).isNotNull();
        assertThat(resp2.getBody().getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp2.getBody().getContent(), ProductAreaResponse::getName)).contains("name2");

        assertThat(resp3.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp3.getBody()).isNotNull();
        assertThat(resp3.getBody().getNumberOfElements()).isEqualTo(1L);
        assertThat(convert(resp3.getBody().getContent(), ProductAreaResponse::getName)).contains("name3");
    }

    @Test
    void getAllProductAreasInvalidStatusParameter() {
        storageService.save(activePoBuilder("name1").build());

        ResponseEntity<ProductAreaPageResponse> resp1 = restTemplate.getForEntity("/productarea?status=ACTIVE1", ProductAreaPageResponse.class);
        ResponseEntity<ProductAreaPageResponse> resp2 = restTemplate.getForEntity("/productarea?status=ACTIVE,PLANNED,INACTIVE,EXTRA", ProductAreaPageResponse.class);

        assertThat(resp1.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp2.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

    }

    @Test
    void searchProductArea() {
        storageService.save(ProductArea.builder().name("the name").build());
        ResponseEntity<ProductAreaPageResponse> resp = restTemplate.getForEntity("/productarea/search/{search}", ProductAreaPageResponse.class, "name");

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(1);
    }

    @Test
    void createProductArea() {
        ProductAreaRequest productArea = createProductAreaRequest();
        ResponseEntity<ProductAreaResponse> resp = restTemplate.postForEntity("/productarea", productArea, ProductAreaResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        ProductAreaResponse body = resp.getBody();
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
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", productArea, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("name -- fieldIsNullOrMissing");
    }

    @Test
    void addTeamsToProductArea() {
        ProductAreaRequest productArea = createProductAreaRequest();
        ResponseEntity<ProductAreaResponse> resp = restTemplate.postForEntity("/productarea", productArea, ProductAreaResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        Team team1 = storageService.save(Team.builder().name("abc").build());
        Team team2 = storageService.save(Team.builder().name("def").build());

        var productAreaId = resp.getBody().getId();
        var addTeamsRequest = AddTeamsToProductAreaRequest.builder()
                .productAreaId(productAreaId.toString())
                .teamIds(List.of(team1.getId().toString(), team2.getId().toString()))
                .build();
        ResponseEntity<?> resp2 = restTemplate.postForEntity("/productarea/addteams", addTeamsRequest, ProductAreaResponse.class);
        assertThat(resp2.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(storageService.get(team1.getId(), Team.class).getProductAreaId()).isEqualTo(productAreaId);
        assertThat(storageService.get(team2.getId(), Team.class).getProductAreaId()).isEqualTo(productAreaId);
    }

    @Test
    void addTeamsToProductArea_TeamDoesntExist() {
        ProductAreaRequest productArea = createProductAreaRequest();
        ResponseEntity<ProductAreaResponse> resp = restTemplate.postForEntity("/productarea", productArea, ProductAreaResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();

        String productAreaId = resp.getBody().getId().toString();
        var addTeamsRequest = AddTeamsToProductAreaRequest.builder()
                .productAreaId(productAreaId)
                .teamIds(List.of("83daedcd-f563-4e3f-85b3-c0553fce742d"))

                .build();
        ResponseEntity<ObjectNode> resp2 = restTemplate.postForEntity("/productarea/addteams", addTeamsRequest, ObjectNode.class);
        assertThat(resp2.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void updateProductArea() {
        ProductAreaRequest productArea = createProductAreaRequest();
        ResponseEntity<ProductAreaResponse> createResp = restTemplate.postForEntity("/productarea", productArea, ProductAreaResponse.class);
        assertThat(createResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResp.getBody()).isNotNull();

        UUID id = createResp.getBody().getId();
        productArea.setId(id.toString());
        productArea.setName("newname");
        ResponseEntity<ProductAreaResponse> resp = restTemplate.exchange("/productarea/{id}", HttpMethod.PUT, new HttpEntity<>(productArea), ProductAreaResponse.class, id);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getName()).isEqualTo("newname");
    }

    @Test
    void deleteProductArea() {
        var productArea = storageService.save(ProductArea.builder().name("name").build());
        restTemplate.delete("/productarea/{id}", productArea.getId());
        assertThat(storageService.exists(productArea.getId(), "ProductArea")).isFalse();
    }

    @Test
    void deleteProductAreaFail_PoHasTeams() {
        var productArea = storageService.save(ProductArea.builder().name("name").build());
        storageService.save(Team.builder().productAreaId(productArea.getId()).build());

        ResponseEntity<String> resp = restTemplate.exchange("/productarea/{id}", HttpMethod.DELETE, HttpEntity.EMPTY, String.class, productArea.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(storageService.exists(productArea.getId(), "ProductArea")).isTrue();
    }

    @Test
    void createProductAreaFailWithErroneousOwnerGroupLackingLeader() {
        var reqBuilder = productAreaRequestBuilderTemplate();
        addIllegalOwnerGroupNoLeader(reqBuilder);
        var req = reqBuilder.build();
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("ownerGroupMemberNavIdList -- paOwnerGroupError");
    }

    @Test
    void createProductAreaFailWithErroneousOwnerAndOwnerGroupIds() {
        var reqBuilder = productAreaRequestBuilderTemplate();
        addIllegalOwnerGroupBadIds(reqBuilder);
        var req = reqBuilder.build();
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("ownerGroupMemberNavIdList -- paOwnerGroupError");
    }

    @Test
    void createProductAreaFailWithDuplicatesInOwnergroup() {
        var reqBuilder = productAreaRequestBuilderTemplate();
        addIllegalOwnerGroupDuplicates(reqBuilder);
        var req = reqBuilder.build();
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("ownerGroupMemberNavIdList -- paOwnerGroupError");
    }

    @Test
    void createProductAreaWithNoOwnerOrOwnerGroup() {
        var req = productAreaRequestBuilderTemplate()
                .ownerGroup(null).build();
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);

    }

    @Test
    void getDefaultArea_checkDefaultProductAreaFlag(){
        ProductArea defaultArea = storageService.save(ProductArea.builder().name("default").areaType(AreaType.OTHER).build());
        when(teamCatalogProps.getDefaultProductareaUuid()).thenReturn(defaultArea.getId().toString());

        ResponseEntity<ProductAreaResponse> resp = restTemplate.getForEntity("/productarea/{id}", ProductAreaResponse.class, defaultArea.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isDefaultArea()).isTrue();
    }

    @Test
    void getNonDefaultArea_checkNotDefaultProductAreaFlag(){
        ProductArea defaultArea = storageService.save(ProductArea.builder().name("default").areaType(AreaType.OTHER).build());
        ProductArea testArea = storageService.save(ProductArea.builder().name("non-default").areaType(AreaType.OTHER).build());
        when(teamCatalogProps.getDefaultProductareaUuid()).thenReturn(defaultArea.getId().toString());

        ResponseEntity<ProductAreaResponse> resp = restTemplate.getForEntity("/productarea/{id}", ProductAreaResponse.class, testArea.getId());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().isDefaultArea()).isFalse();
    }

    @Test
    void getProductAreaStatus() {
        var po1 = createProductAreaRequestWithStatus(DomainObjectStatus.ACTIVE, "po 1");
        var po2 = createProductAreaRequestWithStatus(DomainObjectStatus.INACTIVE, "po 2");
        var po3 = createProductAreaRequestWithStatus(DomainObjectStatus.PLANNED, "po 3");

        var post1 = restTemplate.postForEntity("/productarea", po1, ProductAreaResponse.class);
        var post2 =restTemplate.postForEntity("/productarea", po2, ProductAreaResponse.class);
        var post3 =restTemplate.postForEntity("/productarea", po3, ProductAreaResponse.class);


        ResponseEntity<ProductAreaResponse> resp1 = restTemplate.getForEntity("/productarea/{id}", ProductAreaResponse.class, post1.getBody().getId());
        assertThat(resp1.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp1.getBody()).isNotNull();

        ResponseEntity<ProductAreaResponse> resp2 = restTemplate.getForEntity("/productarea/{id}", ProductAreaResponse.class, post2.getBody().getId());
        assertThat(resp2.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp2.getBody()).isNotNull();

        ResponseEntity<ProductAreaResponse> resp3 = restTemplate.getForEntity("/productarea/{id}", ProductAreaResponse.class, post3.getBody().getId());
        assertThat(resp3.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp3.getBody()).isNotNull();

        assertThat(resp1.getBody().getStatus()).isEqualTo(DomainObjectStatus.ACTIVE);
        assertThat(resp2.getBody().getStatus()).isEqualTo(DomainObjectStatus.INACTIVE);
        assertThat(resp3.getBody().getStatus()).isEqualTo(DomainObjectStatus.PLANNED);
    }

    @Test
    void setProductAreaOwnerGroups() {
        var lederNavident = createOrgEnhetDto().getLeder().getFirst().getRessurs().getNavident();
        var nomLederGruppeNavident = createOrgEnhetDto().getOrganiseringer().getFirst().getOrgEnhet().getLeder().getFirst().getRessurs().getNavident();
        ProductAreaRequest productArea = createProductAreaRequest();
        productArea.setOwnerGroup(new PaOwnerGroupRequest(resouceOne.getNavIdent(), List.of(resouceTwo.getNavIdent()), List.of(resouceZero.getNavIdent(), nomLederGruppeNavident)));
        when(orgService.getOrgEnhetOgUnderEnheter(productArea.getNomId())).thenReturn(createOrgEnhetDto());
        when(orgService.isOrgEnhetInArbeidsomraadeOgDirektorat("nomId")).thenReturn(true);
        ResponseEntity<ProductAreaResponse> resp = restTemplate.postForEntity("/productarea", productArea, ProductAreaResponse.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getPaOwnerGroup().getOwnerResource().getNavIdent()).isEqualTo(lederNavident);
        assertThat(resp.getBody().getPaOwnerGroup().getNomOwnerGroupMemberNavIdList().getFirst().getNavIdent()).isEqualTo(nomLederGruppeNavident);
        assertThat(resp.getBody().getPaOwnerGroup().getOwnerGroupMemberResourceList().getFirst().getNavIdent()).isEqualTo(resouceZero.getNavIdent());
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
                .setLeder(List.of(OrgEnhetsLederDto.builder()
                        .setRessurs(RessursDto.builder()
                                .setFornavn("Nav")
                                .setEtternavn("Navesen")
                                .setVisningsnavn("Nav Navesen")
                                .setNavident("N123456").build()).build()))
                .setOrganiseringer(List.of(OrganiseringDto.builder()
                        .setOrgEnhet(OrgEnhetDto.builder()
                                .setId("orgEnhet-456")
                                .setLeder(List.of(OrgEnhetsLederDto.builder()
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
