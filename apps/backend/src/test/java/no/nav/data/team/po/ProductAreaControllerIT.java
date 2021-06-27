package no.nav.data.team.po;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaController.ProductAreaPageResponse;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.OwnerRole;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.AddTeamsToProductAreaRequest;
import no.nav.data.team.po.dto.PaMemberRequest;
import no.nav.data.team.po.dto.PaOwnerRequest;
import no.nav.data.team.po.dto.PaOwnerResponse;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;

public class ProductAreaControllerIT extends IntegrationTestBase {

    private ResourceResponse resouceZero;
    private ResourceResponse resouceOne;


    @BeforeEach
    void setUp() {
        resouceZero = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(0))).convertToResponse();
        resouceOne = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(1))).convertToResponse();

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
        storageService.save(ProductArea.builder().name("name1").build());
        storageService.save(ProductArea.builder().name("name2").build());
        storageService.save(ProductArea.builder().name("name3").build());
        ResponseEntity<ProductAreaPageResponse> resp = restTemplate.getForEntity("/productarea", ProductAreaPageResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getNumberOfElements()).isEqualTo(3L);
        assertThat(convert(resp.getBody().getContent(), ProductAreaResponse::getName)).contains("name1", "name2", "name3");
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

        var expected = ProductAreaResponse.builder()
                .id(body.getId())
                .name("name")
                .areaType(AreaType.PRODUCT_AREA)
                .description("desc")
                .tags(List.of("tag"))
                .members(List.of(MemberResponse.builder()
                        .navIdent(createNavIdent(0))
                        .description("desc")
                        .resource(resouceZero)
                        .roles(List.of(TeamRole.LEAD))
                        .build()))
                .locations(List.of(
                        Location.builder()
                                .floorId("fa1-a6")
                                .locationCode("A601")
                                .x(200)
                                .y(400)
                                .build()
                ))
                .owners(List.of(PaOwnerResponse.builder().navIdent(createNavIdent(1)).description("desc1").role(
                        OwnerRole.OWNER_LEAD
                ).resource(resouceOne).build()))
                .links(new Links("http://localhost:3000/area/" + body.getId()))
                .build();
        assertThat(body).isEqualTo(expected);
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
        ResponseEntity<?> resp2 = restTemplate.postForEntity("/productarea/addteams", addTeamsRequest, ProductAreaResponse.class);
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
    void createProductAreaWithErroneousOwnerGroupLackingLeader(){
        var req = productAreaRequestBuilderTemplate().owners(illegalOwnerGroupNoLeader()).build();
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("owners -- occurenceCountIllegal");
    }

    @Test
    void createProductAreaWithErroneousOwnerGroupLeaderNotSingular(){
        var req = productAreaRequestBuilderTemplate().owners(illegalOwnerGroupMultipleLeaders()).build();
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody()).contains("owners -- occurenceCountIllegal");
    }

    @Test
    void createProductAreaWithEmptyOwnerGroup(){
        var req = productAreaRequestBuilderTemplate().owners(List.of()).build();
        ResponseEntity<String> resp = restTemplate.postForEntity("/productarea", req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);

    }

    private ProductAreaRequest createProductAreaRequest() {
        return productAreaRequestBuilderTemplate().build();
    }

    private ProductAreaRequest.ProductAreaRequestBuilder productAreaRequestBuilderTemplate(){
        return ProductAreaRequest.builder()
                .name("name")
                .areaType(AreaType.PRODUCT_AREA)
                .description("desc")
                .tags(List.of("tag"))
                .members(List.of(PaMemberRequest.builder()
                        .navIdent(createNavIdent(0)).description("desc").roles(List.of(TeamRole.LEAD)).build()))
                .locations(List.of(
                        Location.builder()
                                .floorId("fa1-a6")
                                .locationCode("A601")
                                .x(200)
                                .y(400)
                                .build()
                ))
                .owners(List.of(PaOwnerRequest.builder()
                        .navIdent(createNavIdent(1)).description("desc1").
                                role(OwnerRole.OWNER_LEAD).build()));
    }

    private List<PaOwnerRequest> illegalOwnerGroupNoLeader(){
        return List.of(
                PaOwnerRequest.builder()
                        .navIdent(createNavIdent(1))
                        .description("desc1")
                        .role(OwnerRole.OWNER_MEMBER)
                        .build()
        );
    }

    private List<PaOwnerRequest> illegalOwnerGroupMultipleLeaders(){
        return List.of(
                PaOwnerRequest.builder()
                        .navIdent(createNavIdent(1))
                        .description("desc1")
                        .role(OwnerRole.OWNER_LEAD)
                        .build(),
                PaOwnerRequest.builder()
                        .navIdent(createNavIdent(2))
                        .description("desc2")
                        .role(OwnerRole.OWNER_LEAD)
                        .build()
        );
    }


}
