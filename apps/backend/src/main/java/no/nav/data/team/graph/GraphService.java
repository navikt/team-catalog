package no.nav.data.team.graph;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.TeamCatalogProps;
import no.nav.data.team.graph.dto.Edge;
import no.nav.data.team.graph.dto.EdgeLabel;
import no.nav.data.team.graph.dto.Network;
import no.nav.data.team.graph.dto.Vertex;
import no.nav.data.team.graph.dto.VertexLabel;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import org.springframework.stereotype.Service;

import java.util.List;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.difference;
import static no.nav.data.common.utils.StreamUtils.filter;

@Slf4j
@Service
public class GraphService {

    private final GraphMapper mapper = new GraphMapper();
    private final GraphClient client;
    private final TeamCatalogProps teamCatalogProps;

    public GraphService(GraphClient client, TeamCatalogProps teamCatalogProps) {
        this.client = client;
        this.teamCatalogProps = teamCatalogProps;
    }

    public void addProductArea(ProductArea productArea) {
        log.info("Writing graph productArea={}", productArea.getId());
        Network network = mapper.mapProductArea(productArea);
        String paVertexId = VertexLabel.ProductArea.id(productArea.getId().toString());
        cleanupPrevMembers(paVertexId, network.getEdges(), EdgeLabel.memberOfProductArea);
        client.writeNetwork(network);
    }

    public void deleteProductArea(ProductArea productArea) {
        if (teamCatalogProps.isPrimary()) {
            log.info("Deleting graph productArea={}", productArea.getId());
            client.deleteVertex(VertexLabel.ProductArea.id(productArea.getId().toString()));
        }
    }

    public void addTeam(Team team) {
        log.info("Writing graph team={}", team.getId());
        Network network = mapper.mapTeam(team);

        var teamVertexId = VertexLabel.Team.id(team.getId().toString());
        cleanupPrevProductArea(team, teamVertexId);
        cleanupPrevMembers(teamVertexId, network.getEdges(), EdgeLabel.memberOfTeam);

        client.writeNetwork(network);
    }

    public void deleteTem(Team team) {
        if (teamCatalogProps.isPrimary()) {
            log.info("Deleting graph team={}", team.getId());
            client.deleteVertex(VertexLabel.Team.id(team.getId().toString()));
        }
    }

    private void cleanupPrevProductArea(Team team, String teamVertexId) {
        var existingProductAreaVertexId = VertexLabel.ProductArea.id(team.getProductAreaId());

        var existingProductAreaVertex = client.getVerticesForEdgeOut(teamVertexId, EdgeLabel.partOfProductArea);
        if (!existingProductAreaVertex.isEmpty()
                && (existingProductAreaVertex.size() > 1 || !existingProductAreaVertex.get(0).getId().equals(existingProductAreaVertexId))
        ) {
            log.info("deleting pa-team edges {}", existingProductAreaVertex.size());
            existingProductAreaVertex.forEach(v -> removeVertexConnection(teamVertexId, v.getId()));
        }
    }

    private void cleanupPrevMembers(String parentId, List<Edge> edges, EdgeLabel memberEdgeLabel) {
        var existingMemberVertices = client.getVerticesForEdgeIn(parentId, memberEdgeLabel);
        if (!existingMemberVertices.isEmpty()) {
            var oldMembers = convert(existingMemberVertices, Vertex::getId);
            var newMembers = convert(filter(edges, e -> e.getLabel() == memberEdgeLabel), Edge::getInV);
            var diff = difference(oldMembers, newMembers);
            log.info("deleting members {}", diff.getRemoved());
            diff.getRemoved().forEach(id -> removeVertexConnection(id, parentId));
        }
    }

    private void removeVertexConnection(String vertexId1, String vertexId2) {
        client.deleteEdge(vertexId1, vertexId2);
        client.deleteEdge(vertexId2, vertexId1);
    }

}
