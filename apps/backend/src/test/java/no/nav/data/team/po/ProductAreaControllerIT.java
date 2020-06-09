package no.nav.data.team.po;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.TestDataHelper;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaController.ProductAreaPageResponse;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.AddTeamsToProductAreaRequest;
import no.nav.data.team.po.dto.PaMemberRequest;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.resource.dto.ResourceResponse;
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

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static no.nav.data.team.common.utils.StreamUtils.convert;
import static org.assertj.core.api.Assertions.assertThat;

public class ProductAreaControllerIT extends IntegrationTestBase {

    private ResourceResponse resouceZero;

    @BeforeEach
    void setUp() {
        resouceZero = addNomResource(TestDataHelper.createResource("Fam", "Giv", createNavIdent(0))).convertToResponse();
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
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getId()).isNotNull();
        assertThat(resp.getBody()).isEqualTo(ProductAreaResponse.builder()
                .id(resp.getBody().getId())
                .name("name")
                .description("desc")
                .tags(List.of("tag"))
                .members(List.of(MemberResponse.builder()
                        .navIdent(createNavIdent(0))
                        .description("desc")
                        .resource(resouceZero)
                        .roles(List.of(TeamRole.LEAD))
                        .build()))
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

        String productAreaId = resp.getBody().getId().toString();
        var addTeamsRequest = AddTeamsToProductAreaRequest.builder()
                .productAreaId(productAreaId)
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
        storageService.save(Team.builder().productAreaId(productArea.getId().toString()).build());

        ResponseEntity<String> resp = restTemplate.exchange("/productarea/{id}", HttpMethod.DELETE, HttpEntity.EMPTY, String.class, productArea.getId());
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(storageService.exists(productArea.getId(), "ProductArea")).isTrue();
    }

    private ProductAreaRequest createProductAreaRequest() {
        return ProductAreaRequest.builder()
                .name("name")
                .description("desc")
                .tags(List.of("tag"))
                .members(List.of(PaMemberRequest.builder().navIdent(createNavIdent(0)).description("desc").roles(List.of(TeamRole.LEAD)).build()))
                .build();
    }
}
