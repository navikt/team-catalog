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
import no.nav.data.team.cluster.domain.Cluster;
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

    public void addCluster(Cluster cluster) {
        log.info("Writing graph cluster={}", cluster.getId());
        Network network = mapper.mapCluster(cluster);
        String clusterVertexId = VertexLabel.Cluster.id(cluster.getId().toString());
        cleanupPrevMembers(clusterVertexId, network.getEdges(), EdgeLabel.memberOfCluster);
        client.writeNetwork(network);
    }

    public void deleteCluster(Cluster cluster) {
        if (teamCatalogProps.isPrimary()) {
            log.info("Deleting graph cluster={}", cluster.getId());
            client.deleteVertex(VertexLabel.Cluster.id(cluster.getId().toString()));
        }
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
        cleanupPrevCluster(team, teamVertexId);
        cleanupPrevMembers(teamVertexId, network.getEdges(), EdgeLabel.memberOfTeam);

        client.writeNetwork(network);
    }

    public void deleteTeam(Team team) {
        if (teamCatalogProps.isPrimary()) {
            log.info("Deleting graph team={}", team.getId());
            client.deleteVertex(VertexLabel.Team.id(team.getId().toString()));
        }
    }

    private void cleanupPrevCluster(Team team, String teamVertexId) {
        var newClusterIds = convert(team.getClusterIds(), VertexLabel.Cluster::id);
        var existingClusterVertices = client.getVerticesForEdgeOut(teamVertexId, EdgeLabel.partOfCluster);

        //Let's find the old ones that are not part of the new object, and delete them
        existingClusterVertices.forEach(existingClusterVertex -> {
            var delete = newClusterIds.stream().noneMatch(v -> existingClusterVertex.getId().equals(v));

            if (delete) {
                log.info("deleting cluster-team edge {}", existingClusterVertex.getId());
                removeVertexConnection(teamVertexId, existingClusterVertex.getId());
            }
        });
    }

    private void cleanupPrevProductArea(Team team, String teamVertexId) {
        var productAreaVertexId = VertexLabel.ProductArea.id(team.getProductAreaId());

        var existingProductAreaVertices = client.getVerticesForEdgeOut(teamVertexId, EdgeLabel.partOfProductArea);
        var delete = existingProductAreaVertices.stream().noneMatch(v -> productAreaVertexId.equals(v.getId()));

        if (delete) {
            log.info("deleting pa-team edges {}", existingProductAreaVertices.size());
            existingProductAreaVertices.forEach(v -> removeVertexConnection(teamVertexId, v.getId()));
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
