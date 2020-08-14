package no.nav.data.team.graph;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.web.TraceHeaderFilter;
import no.nav.data.team.graph.dto.EdgeLabel;
import no.nav.data.team.graph.dto.Network;
import no.nav.data.team.graph.dto.Vertex;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;

@Slf4j
@Component
public class GraphClient {

    private final WebClient client;
    private final boolean disabled;

    public GraphClient(WebClient.Builder webClientBuilder, GraphProperties graphProperties) {
        disabled = graphProperties.isDisabled();
        this.client = webClientBuilder
                .baseUrl(graphProperties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + graphProperties.getApiToken())
                .filter(new TraceHeaderFilter(true))
                .build();
    }

    public void writeNetwork(Network network) {
        if (disabled) {
            return;
        }
        network.cleanDuplicatesAndValidate();
        log.info("Writing graph {}", JsonUtils.toJson(network));
        client.put()
                .uri("/node")
                .bodyValue(network.getVertices())
                .exchange()
                .block();

        client.put()
                .uri("/edge")
                .bodyValue(network.getEdges())
                .exchange()
                .block();
    }

    public void deleteVertex(String vertexId) {
        if (disabled) {
            return;
        }
        client.delete()
                .uri("/node/delete?node_id={id}", vertexId)
                .exchange()
                .block();
    }

    public void deleteEdge(String id1, String id2) {
        if (disabled) {
            return;
        }
        client.delete()
                .uri("/edge?n1={id1}&n2={id2}", id1, id2)
                .exchange()
                .block();
    }

    public List<Vertex> getVerticesForEdgeIn(String vertexId, EdgeLabel edgeLabel) {
        if (disabled) {
            return List.of();
        }
        try {
            List<Vertex> vertices = client.get()
                    .uri("/node/in/{vertexId}/{label}", vertexId, edgeLabel)
                    .retrieve()
                    .bodyToFlux(Vertex.class).collectList().block();
            return vertices == null ? List.of() : vertices;
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return List.of();
            }
            throw e;
        }
    }

}
