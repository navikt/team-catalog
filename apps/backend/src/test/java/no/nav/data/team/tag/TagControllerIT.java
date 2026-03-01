package no.nav.data.team.tag;

import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TagControllerIT extends IntegrationTestBase {

    @Test
    void findAllTags() {
        storageService.save(Team.builder().tags(List.of("tag1", "tag2", "tag3")).build());
        storageService.save(ProductArea.builder().tags(List.of("tag2", "tag3", "tag4")).build());

        assertThat(get("/tag")).containsExactly("tag1", "tag2", "tag3", "tag4");
    }

    @Test
    void searchTags() {
        storageService.save(ProductArea.builder().tags(List.of("the taggy", "house", "boat", "tag1")).build());
        storageService.save(Team.builder().tags(List.of("other", "tag1")).build());

        assertThat(get("/tag/search/tag")).containsExactly("tag1", "the taggy");
    }

    private List<String> get(String url) {
        var res = restTestClient.get().uri(url)
                .exchange()
                .expectStatus().isOk()
                .expectBody(new ParameterizedTypeReference<RestResponsePage<String>>() {})
                .returnResult()
                .getResponseBody();

        assertThat(res).isNotNull();
        return res.getContent();
    }
}