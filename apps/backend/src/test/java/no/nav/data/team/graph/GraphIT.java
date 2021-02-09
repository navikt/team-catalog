package no.nav.data.team.graph;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.putRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;

class GraphIT extends IntegrationTestBase {
    @Autowired
    GraphService graphService;

    @Test
    void SyncProductArea() {
        var productArea = ProductArea.builder().name("PASyncTest").id(UUID.randomUUID()).build();
        graphService.addProductArea(productArea);
        verify(putRequestedFor(urlEqualTo("/datacatgraph/node"))
                .withRequestBody(matchingJsonPath("$.length()", equalTo("1")))
                .withRequestBody(matchingJsonPath("$[0].id", equalTo("ProductArea.%s".formatted(productArea.getId())))));
    }

    @Test
    void SyncTeam() {
        var team = Team.builder().name("TeamSyncTest").id(UUID.randomUUID()).build();
        graphService.addTeam(team);
        verify(putRequestedFor(urlEqualTo("/datacatgraph/node"))
                .withRequestBody(matchingJsonPath("$.length()", equalTo("1")))
                .withRequestBody(matchingJsonPath("$[0].id", equalTo("Team.%s".formatted(team.getId())))));
    }

    @Test
    void SyncCluster() {
        var cluster = Cluster.builder().name("ClusterSyncTest").id(UUID.randomUUID()).build();
        graphService.addCluster(cluster);
        verify(putRequestedFor(urlEqualTo("/datacatgraph/node"))
                .withRequestBody(matchingJsonPath("$.length()", equalTo("1")))
                .withRequestBody(matchingJsonPath("$[0].id", equalTo("Cluster.%s".formatted(cluster.getId())))));
    }
}