package no.nav.data.team.resource;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.resource.ResourceController.ResourcePageResponse;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.resource.dto.ResourceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

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
                createResource("Mart", "Guy", "S923457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Yes Sir", "Heh", "S123460")
        ));
    }

    @Test
    void getResource() {
        var resource = restTestClient.get().uri("/resource/{ident}", "S123456")
                .exchange()
                .expectStatus().isOk()
                .expectBody(ResourceResponse.class)
                .returnResult()
                .getResponseBody();
        assertThat(resource).isNotNull();
        assertThat(resource.getNavIdent()).isEqualTo("S123456");
        assertThat(resource.getGivenName()).isEqualTo("Given");
        assertThat(resource.getFamilyName()).isEqualTo("Family");
        assertThat(resource.getResourceType()).isEqualTo(ResourceType.EXTERNAL);
    }

    @Test
    void getResources() {
        var resource = restTestClient.post().uri("/resource/multi")
                .body(List.of("S123456", "S923457"))
                .exchange()
                .expectStatus().isOk()
                .expectBody(ResourcePageResponse.class)
                .returnResult()
                .getResponseBody();
        assertThat(resource).isNotNull();
        assertThat(resource.getContent()).hasSize(2);
        assertThat(resource.getContent().get(0).getGivenName()).isEqualTo("Given");
        assertThat(resource.getContent().get(1).getGivenName()).isEqualTo("Guy");
    }

}