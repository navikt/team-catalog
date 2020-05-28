package no.nav.data.team.graph;

import lombok.extern.slf4j.Slf4j;
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
    private final boolean enabled;

    public GraphClient(WebClient.Builder webClientBuilder, GraphProperties graphProperties) {
        enabled = graphProperties.isEnabled();
        this.client = webClientBuilder
                .baseUrl(graphProperties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + graphProperties.getApiToken())
                .build();
    }

    public void writeNetwork(Network network) {
        if (!enabled) {
            return;
        }
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

    public void deleteVertex(String id) {
        if (!enabled) {
            return;
        }
        client.delete()
                .uri("/node/delete?node_id={id}", id)
                .exchange()
                .block();
    }

    public void deleteEdge(String id1, String id2) {
        if (!enabled) {
            return;
        }
        client.delete()
                .uri("/edge?n1={id1}&n2={id2}", id1, id2)
                .exchange()
                .block();
    }

    public List<Vertex> getVerticesForEdgeOut(String vertexId, EdgeLabel edgeLabel) {
        if (!enabled) {
            return List.of();
        }
        try {
            return client.get()
                    .uri("/node/out/{vertexId}/{label}", vertexId, edgeLabel)
                    .retrieve()
                    .bodyToFlux(Vertex.class).collectList().block();
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return List.of();
            }
            throw e;
        }
    }

    public List<Vertex> getVerticesForEdgeIn(String vertexId, EdgeLabel edgeLabel) {
        if (!enabled) {
            return List.of();
        }
        try {
            return client.get()
                    .uri("/node/in/{vertexId}/{label}", vertexId, edgeLabel)
                    .retrieve()
                    .bodyToFlux(Vertex.class).collectList().block();
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return List.of();
            }
            throw e;
        }
    }
}
