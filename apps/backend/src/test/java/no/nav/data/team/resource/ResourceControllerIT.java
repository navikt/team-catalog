package no.nav.data.team.resource;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.resource.ResourceController.ResourcePageResponse;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.resource.dto.ResourceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static no.nav.data.team.TestDataHelper.createResource;
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
    void getResource() {
        ResponseEntity<ResourceResponse> resource = restTemplate.getForEntity("/resource/{ident}", ResourceResponse.class, "S123456");
        assertThat(resource.getBody()).isNotNull();
        assertThat(resource.getBody().getNavIdent()).isEqualTo("S123456");
        assertThat(resource.getBody().getGivenName()).isEqualTo("Given");
        assertThat(resource.getBody().getFamilyName()).isEqualTo("Family");
        assertThat(resource.getBody().getResourceType()).isEqualTo(ResourceType.EXTERNAL);
    }

    @Test
    void getResources() {
        ResponseEntity<ResourcePageResponse> resource = restTemplate.postForEntity("/resource/multi", List.of("S123456", "S123457"), ResourcePageResponse.class);
        assertThat(resource.getBody()).isNotNull();
        assertThat(resource.getBody().getContent()).hasSize(2);
        assertThat(resource.getBody().getContent().get(0).getGivenName()).isEqualTo("Given");
        assertThat(resource.getBody().getContent().get(1).getGivenName()).isEqualTo("Guy");
    }

    @Test
    void searchResources() {
        ResponseEntity<ResourcePageResponse> teams = restTemplate.getForEntity("/resource/search/{name}", ResourcePageResponse.class, "mart");
        assertThat(teams.getBody()).isNotNull();
        assertThat(teams.getBody().getContent()).hasSize(2);
        assertThat(teams.getBody().getContent().get(0).getNavIdent()).isEqualTo("S123457");
        assertThat(teams.getBody().getContent().get(1).getNavIdent()).isEqualTo("S123458");
    }
}