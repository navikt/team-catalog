package no.nav.data.team.graph;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.web.TraceHeaderFilter;
import no.nav.data.team.graph.dto.Edge;
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

    public GraphClient(WebClient.Builder webClientBuilder, GraphProperties graphProperties) {
        this.client = webClientBuilder
                .baseUrl(graphProperties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + graphProperties.getApiToken())
                .filter(new TraceHeaderFilter(true))
                .build();
    }

    public void writeNetwork(Network network) {
        network.cleanDuplicatesAndValidate();
        List<Vertex> vertices = network.getVertices();

        log.info("Writing graph vertices {}", JsonUtils.toJson(vertices));
        client.put()
                .uri("/node")
                .bodyValue(vertices)
                .exchange()
                .doOnSuccess(clientResponse -> log.trace("success"))
                .doOnError(t -> {
                    throw new TechnicalException("graph error vertices", t);
                })
                .block();

        List<Edge> edges = network.getEdges();
        log.info("Writing graph edges {}", JsonUtils.toJson(edges));
        client.put()
                .uri("/edge")
                .bodyValue(edges)
                .exchange()
                .doOnSuccess(clientResponse -> log.trace("success"))
                .doOnError(t -> {
                    throw new TechnicalException("graph error edges", t);
                })
                .block();
    }

    public void deleteVertex(String vertexId) {
        client.delete()
                .uri("/node/delete/id/{id}", vertexId)
                .exchange()
                .doOnSuccess(clientResponse -> log.trace("success"))
                .doOnError(t -> {
                    throw new TechnicalException("graph error edges", t);
                })
                .block();
    }

    public void deleteEdge(String id1, String id2) {
        client.delete()
                .uri("/edge?n1={id1}&n2={id2}", id1, id2)
                .exchange()
                .doOnSuccess(clientResponse -> log.trace("success"))
                .doOnError(t -> {
                    throw new TechnicalException("graph error edges", t);
                })
                .block();
    }

    public List<Vertex> getVerticesForEdgeOut(String vertexId, EdgeLabel edgeLabel) {
        try {
            List<Vertex> vertices = client.get()
                    .uri("/node/out/{vertexId}/{label}", vertexId, edgeLabel)
                    .retrieve()
                    .bodyToFlux(Vertex.class).collectList().block();
            // service responds with 200 '{}' when none found and webclient thinks that means one empty object...
            return vertices == null || (vertices.size() == 1 && vertices.get(0).getId() == null) ? List.of() : vertices;
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return List.of();
            }
            throw e;
        }
    }

    public List<Vertex> getVerticesForEdgeIn(String vertexId, EdgeLabel edgeLabel) {
        try {
            List<Vertex> vertices = client.get()
                    .uri("/node/in/{vertexId}/{label}", vertexId, edgeLabel)
                    .retrieve()
                    .bodyToFlux(Vertex.class).collectList().block();
            // service responds with 200 '{}' when none found and webclient thinks that means one empty object...
            return vertices == null || (vertices.size() == 1 && vertices.get(0).getId() == null) ? List.of() : vertices;
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return List.of();
            }
            throw e;
        }
    }

}
