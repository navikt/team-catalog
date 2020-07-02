package no.nav.data.team.graph;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.graph.dto.EdgeLabel;
import no.nav.data.team.graph.dto.Network;
import no.nav.data.team.graph.dto.Vertex;
import no.nav.data.team.graph.dto.VertexLabel;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.difference;
import static no.nav.data.common.utils.StreamUtils.filter;

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
        Network network = mapper.mapProductArea(productArea);
        cleanupMembers(productArea.getId(), network.getVertices(), VertexLabel.ProductAreaMember, EdgeLabel.memberOfProductArea);
        client.writeNetwork(network);
    }

    public void deleteProductArea(ProductArea productArea) {
        log.info("Deleting graph productArea={}", productArea.getId());
        cleanupMembers(productArea.getId(), List.of(), VertexLabel.ProductAreaMember, EdgeLabel.memberOfProductArea);
        client.deleteVertex(productArea.getId().toString());
    }

    public void addTeam(Team team) {
        log.info("Writing graph team={}", team.getId());
        Network network = mapper.mapTeam(team);
        cleanupMembers(team.getId(), network.getVertices(), VertexLabel.TeamMember, EdgeLabel.memberOfTeam);

        // Cleanup old productArea
        var existingProductAreaVertex = client.getVerticesForEdgeIn(team.getId().toString(), EdgeLabel.partOfProductArea);
        if (!existingProductAreaVertex.isEmpty()
                && (existingProductAreaVertex.size() > 1 || !existingProductAreaVertex.get(0).getId().equals(team.getProductAreaId()))) {
            log.info("deleting pa-team edges {}", existingProductAreaVertex.size());
            existingProductAreaVertex.forEach(v -> client.deleteEdge(v.getId(), team.getId().toString()));
        }

        client.writeNetwork(network);
    }

    public void deleteTem(Team team) {
        log.info("Deleting graph team={}", team.getId());
        cleanupMembers(team.getId(), List.of(), VertexLabel.TeamMember, EdgeLabel.memberOfTeam);
        client.deleteVertex(team.getId().toString());
    }

    private void cleanupMembers(UUID parentId, List<Vertex> vertices, VertexLabel memberVertexLabel, EdgeLabel memberEdgeLabel) {
        var existingMemberVertices = client.getVerticesForEdgeOut(parentId.toString(), memberEdgeLabel);
        if (!existingMemberVertices.isEmpty()) {
            var oldMembers = convert(existingMemberVertices, Vertex::getId);
            var newMembers = convert(filter(vertices, v -> v.getLabel() == memberVertexLabel), Vertex::getId);
            var diff = difference(oldMembers, newMembers);
            log.info("deleting members {}", diff.getRemoved());
            diff.getRemoved().forEach(client::deleteVertex);
        }
    }

}
