package no.nav.data.team.resource;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.resource.ResourceController.MembershipResponse;
import no.nav.data.team.resource.ResourceController.ResourcePageResponse;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.dto.TeamResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static no.nav.data.team.TestDataHelper.createResource;
import static no.nav.data.team.common.utils.StreamUtils.convert;
import static org.assertj.core.api.Assertions.assertThat;

class ResourceControllerIT extends IntegrationTestBase {

    @Autowired
    private NomClient client;

    @BeforeEach
    void setUp() {
        client.add(List.of(
                createResource("Family", "Given", "S123456"),
                createResource("Mart", "Guy", "S123457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Yes Sir", "Heh", "S123460")
        ));
    }

    @Test
    void getTeam() {
        ResponseEntity<ResourceResponse> resource = restTemplate.getForEntity("/resource/{ident}", ResourceResponse.class, "S123456");
        assertThat(resource.getBody()).isNotNull();
        assertThat(resource.getBody().getNavIdent()).isEqualTo("S123456");
        assertThat(resource.getBody().getGivenName()).isEqualTo("Given");
        assertThat(resource.getBody().getFamilyName()).isEqualTo("Family");
        assertThat(resource.getBody().getResourceType()).isEqualTo(ResourceType.EXTERNAL);
    }

    @Test
    void searchTeams() {
        ResponseEntity<ResourcePageResponse> teams = restTemplate.getForEntity("/resource/search/{name}", ResourcePageResponse.class, "mart");
        assertThat(teams.getBody()).isNotNull();
        assertThat(teams.getBody().getContent()).hasSize(2);
        assertThat(teams.getBody().getContent().get(0).getNavIdent()).isEqualTo("S123457");
        assertThat(teams.getBody().getContent().get(1).getNavIdent()).isEqualTo("S123458");
    }

    @Test
    void getMemberships() {
        String navIdent = "S123123";
        storageService.save(ProductArea.builder().name("pa name1").members(List.of(PaMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("name1").members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("name2").members(List.of(TeamMember.builder().navIdent(navIdent).build())).build());
        storageService.save(Team.builder().name("name3").build());
        ResponseEntity<MembershipResponse> resp = restTemplate.getForEntity("/resource/membership/{ident}", MembershipResponse.class, navIdent);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getTeams().size()).isEqualTo(2L);
        assertThat(convert(resp.getBody().getTeams(), TeamResponse::getName)).contains("name1", "name2");
        assertThat(resp.getBody().getProductAreas().size()).isEqualTo(1L);
        assertThat(convert(resp.getBody().getProductAreas(), ProductAreaResponse::getName)).contains("pa name1");
    }
}