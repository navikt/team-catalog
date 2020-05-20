package no.nav.data.team.tag;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.tag.TagController.TagPageResponse;
import no.nav.data.team.team.domain.Team;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TagControllerTest extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void findAllTags() {
        storageService.save(Team.builder().tags(List.of("tag1", "tag2", "tag3")).build());
        storageService.save(ProductArea.builder().tags(List.of("tag2", "tag3", "tag4")).build());

        assertThat(get("/tag")).contains("tag1", "tag2", "tag3", "tag4");
    }

    @Test
    void searchTags() {
        storageService.save(ProductArea.builder().tags(List.of("the taggy", "house", "boat")).build());
        storageService.save(Team.builder().tags(List.of("other", "tag1")).build());

        assertThat(get("/tag/search/tag")).contains("tag1", "the taggy");
    }

    private List<String> get(String url) {
        var res = restTemplate.getForEntity(url, TagPageResponse.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotNull();
        return res.getBody().getContent();
    }
}