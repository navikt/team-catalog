package no.nav.data.team.graph;

import no.nav.data.team.graph.dto.Edge;
import no.nav.data.team.graph.dto.EdgeLabel;
import no.nav.data.team.graph.dto.EdgeProps;
import no.nav.data.team.graph.dto.Network;
import no.nav.data.team.graph.dto.Network.NetworkBuilder;
import no.nav.data.team.graph.dto.Vertex;
import no.nav.data.team.graph.dto.VertexLabel;
import no.nav.data.team.graph.dto.props.MemberProps;
import no.nav.data.team.graph.dto.props.ProductAreaProps;
import no.nav.data.team.graph.dto.props.ResourceProps;
import no.nav.data.team.graph.dto.props.TeamProps;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;

import java.time.LocalDateTime;

import static no.nav.data.common.utils.StreamUtils.copyOf;

public class GraphMapper {

    public Network mapTeam(Team team) {
        Vertex teamVertex = Vertex.builder()
                .id(team.getId().toString())
                .label(VertexLabel.Team)
                .properties(TeamProps.builder()
                        .name(team.getName())
                        .description(team.getDescription())
                        .teamType(team.getTeamType())
                        .slackChannel(team.getSlackChannel())
                        .naisTeams(copyOf(team.getNaisTeams()))
                        .tags(copyOf(team.getTags()))
                        .lastChanged(team.getChangeStamp() == null ? LocalDateTime.now() : team.getChangeStamp().getLastModifiedDate())
                        .build())
                .build();

        NetworkBuilder network = Network.builder().vertex(teamVertex);

        team.getMembers().forEach(m -> {
            Network memberNetwork = map(teamVertex, m);
            network.vertices(memberNetwork.getVertices());
            network.edges(memberNetwork.getEdges());
        });

        if (team.getProductAreaId() != null) {
            network.edge(Edge.builder()
                    .inV(teamVertex.getId())
                    .label(EdgeLabel.partOfProductArea)
                    .outV(VertexLabel.ProductArea.id(team.getProductAreaId()))
                    .build());
        }

        Network build = network.build();
        build.cleanDuplicatesAndValidate();
        return build;
    }

    public Network mapProductArea(ProductArea pa) {
        Vertex paVertex = Vertex.builder()
                .id(pa.getId().toString())
                .label(VertexLabel.ProductArea)
                .properties(ProductAreaProps.builder()
                        .description(pa.getDescription())
                        .name(pa.getName())
                        .tags(pa.getTags())
                        .lastChanged(pa.getChangeStamp() == null ? LocalDateTime.now() : pa.getChangeStamp().getLastModifiedDate())
                        .build())
                .build();

        NetworkBuilder network = Network.builder().vertex(paVertex);

        pa.getMembers().forEach(m -> {
            Network memberNetwork = map(paVertex, m);
            network.vertices(memberNetwork.getVertices());
            network.edges(memberNetwork.getEdges());
        });

        return network.build();
    }

    private Network map(Vertex team, TeamMember m) {
        MemberProps memberProps = MemberProps.builder()
                .description(m.getDescription())
                .roles(copyOf(m.getRoles()))
                .build();
        return map(team, m.getNavIdent(), memberProps, EdgeLabel.memberOfTeam);
    }

    private Network map(Vertex pa, PaMember m) {
        MemberProps memberProps = MemberProps.builder()
                .description(m.getDescription())
                .roles(copyOf(m.getRoles()))
                .build();
        return map(pa, m.getNavIdent(), memberProps, EdgeLabel.memberOfProductArea);
    }

    private Network map(Vertex parent, String navIdent, EdgeProps edgeProps, EdgeLabel edgeLabel) {
        Vertex resource = Vertex.builder()
                .id(navIdent)
                .label(VertexLabel.Person)
                .properties(ResourceProps.builder().navident(navIdent).build())
                .build();

        return Network.builder()
                // skip writing the resource node, graph should populate it already and if it doesn't exist it shouldn't fail our write
                // .vertex(resource)
                .edge(Edge.builder()
                        .inV(resource.getId())
                        .label(edgeLabel)
                        .outV(parent.getId())
                        .properties(edgeProps)
                        .build())
                .build();
    }
}
