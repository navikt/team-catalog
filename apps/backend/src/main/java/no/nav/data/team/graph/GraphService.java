package no.nav.data.team.graph;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.graph.dto.EdgeLabel;
import no.nav.data.team.graph.dto.Network;
import no.nav.data.team.graph.dto.VertexLabel;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import org.springframework.stereotype.Service;

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
        client.writeNetwork(network);
    }

    public void deleteProductArea(ProductArea productArea) {
        log.info("Deleting graph productArea={}", productArea.getId());
        client.deleteVertex(VertexLabel.ProductArea, productArea.getId().toString());
    }

    public void addTeam(Team team) {
        log.info("Writing graph team={}", team.getId());
        Network network = mapper.mapTeam(team);

        // Cleanup old productArea
        var existingProductAreaVertex = client.getVerticesForEdgeIn(VertexLabel.Team, team.getId().toString(), EdgeLabel.partOfProductArea);
        if (!existingProductAreaVertex.isEmpty()
                && (existingProductAreaVertex.size() > 1 || !existingProductAreaVertex.get(0).getId().equals(team.getProductAreaId()))) {
            log.info("deleting pa-team edges {}", existingProductAreaVertex.size());
            existingProductAreaVertex.forEach(v -> client.deleteEdge(v.getId(), team.getId().toString()));
        }

        client.writeNetwork(network);
    }

    public void deleteTem(Team team) {
        log.info("Deleting graph team={}", team.getId());
        client.deleteVertex(VertexLabel.Team, team.getId().toString());
    }

}
