package no.nav.data.team.graph;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.graph.dto.EdgeLabel;
import no.nav.data.team.graph.dto.Vertex;
import no.nav.data.team.graph.dto.VertexLabel;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.difference;
import static no.nav.data.team.common.utils.StreamUtils.filter;

@Slf4j
@Service
public class GraphService {

    private final GraphMapper mapper = new GraphMapper();
    private final GraphClient client;

    public GraphService(GraphClient client) {
        this.client = client;
    }

    public void addProductArea(ProductArea productArea) {
        log.info("Writing graph productArea={}", productArea.getId());
        client.writeNetwork(mapper.mapProductArea(productArea));
    }

    public void deleteProductArea(ProductArea productArea) {
        log.info("Deleting graph productArea={}", productArea.getId());
        client.deleteVertex(productArea.getId().toString());
    }

    public void addTeam(Team team) {
        log.info("Writing graph team={}", team.getId());
        var network = mapper.mapTeam(team);

        // Cleanup old memberships
        var existingMemberVertices = client.getVerticesForEdgeOut(team.getId().toString(), EdgeLabel.memberOfTeam);
        if (!existingMemberVertices.isEmpty()) {
            var oldMembers = convert(existingMemberVertices, Vertex::getId);
            var newMembers = convert(filter(network.getVertices(), v -> v.getLabel() == VertexLabel.TeamMember), Vertex::getId);
            var diff = difference(oldMembers, newMembers);
            log.info("deleting members {}", diff.getRemoved());
            diff.getRemoved().forEach(client::deleteVertex);
        }

        // Cleanup old productArea
        var existingProductAreaVertex = client.getVerticesForEdgeIn(team.getId().toString(), EdgeLabel.partOfProductArea);
        if (!existingProductAreaVertex.isEmpty()
                && (existingProductAreaVertex.size() > 1 || !existingProductAreaVertex.get(0).getId().equals(team.getProductAreaId()))) {
            log.info("deleting pa-team edges {}", existingProductAreaVertex.size());
            existingProductAreaVertex.forEach(v -> client.deleteEdge(v.getId(), team.getId().toString()));
        }

        log.info("Writing team graph {}", network);
        client.writeNetwork(network);
    }

    public void deleteTem(Team team) {
        log.info("Deleting graph team={}", team.getId());
        var network = mapper.mapTeam(team);
        var vertices = filterNonDeletes(network.getVertices());
        log.info("Deleting graph items {}", vertices);
        vertices.forEach(v -> client.deleteVertex(v.getId()));
    }

    // Resource can belong to other teams
    private List<Vertex> filterNonDeletes(List<Vertex> vertices) {
        return vertices.stream()
                .filter(v -> v.getLabel() != VertexLabel.Resource)
                .collect(Collectors.toList());
    }
}
