package no.nav.data.team.graph;

import no.nav.data.team.graph.dto.Edge;
import no.nav.data.team.graph.dto.EdgeLabel;
import no.nav.data.team.graph.dto.Network;
import no.nav.data.team.graph.dto.Network.NetworkBuilder;
import no.nav.data.team.graph.dto.Vertex;
import no.nav.data.team.graph.dto.VertexLabel;
import no.nav.data.team.graph.dto.VertexProps;
import no.nav.data.team.graph.dto.props.MemberProps;
import no.nav.data.team.graph.dto.props.ProductAreaProps;
import no.nav.data.team.graph.dto.props.ResourceProps;
import no.nav.data.team.graph.dto.props.ResourceProps.ResourcePropsBuilder;
import no.nav.data.team.graph.dto.props.TeamProps;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;

import java.time.LocalDateTime;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.copyOf;

public class GraphMapper {

    public Network mapTeam(Team team) {
        NetworkBuilder network = Network.builder()
                .vertex(Vertex.builder()
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
                        .build());

        team.getMembers().forEach(m -> {
            Network memberNetwork = map(team.getId(), m);
            network.vertices(memberNetwork.getVertices());
            network.edges(memberNetwork.getEdges());
        });

        if (team.getProductAreaId() != null) {
            network.edge(Edge.builder()
                    .inV(team.getId().toString())
                    .label(EdgeLabel.partOfProductArea)
                    .outV(team.getProductAreaId())
                    .build());
        }

        Network build = network.build();
        build.cleanAndSetPartitionKeys();
        return build;
    }

    public Network mapProductArea(ProductArea pa) {
        NetworkBuilder network = Network.builder()
                .vertex(Vertex.builder()
                        .id(pa.getId().toString())
                        .label(VertexLabel.ProductArea)
                        .properties(ProductAreaProps.builder()
                                .description(pa.getDescription())
                                .name(pa.getName())
                                .tags(pa.getTags())
                                .lastChanged(pa.getChangeStamp() == null ? LocalDateTime.now() : pa.getChangeStamp().getLastModifiedDate())
                                .build())
                        .build());

        pa.getMembers().forEach(m -> {
            Network memberNetwork = map(pa.getId(), m);
            network.vertices(memberNetwork.getVertices());
            network.edges(memberNetwork.getEdges());
        });

        return network.build();
    }

    private Network map(UUID teamId, TeamMember m) {
        MemberProps memberProps = MemberProps.builder()
                .navIdent(m.getNavIdent())
                .description(m.getDescription())
                .roles(copyOf(m.getRoles()))
                .build();
        return map(teamId, m.getNavIdent(), memberProps, VertexLabel.TeamMember, EdgeLabel.memberOfTeam);
    }

    private Network map(UUID paId, PaMember m) {
        MemberProps memberProps = MemberProps.builder()
                .navIdent(m.getNavIdent())
                .description(m.getDescription())
                .roles(copyOf(m.getRoles()))
                .build();
        return map(paId, m.getNavIdent(), memberProps, VertexLabel.ProductAreaMember, EdgeLabel.memberOfProductArea);
    }

    private Network map(UUID parentId, String navIdent, VertexProps vertexProps, VertexLabel vertexLabel, EdgeLabel edgeLabel) {
        Vertex member = Vertex.builder()
                .id(parentId + navIdent)
                .label(vertexLabel)
                .properties(vertexProps)
                .build();

        ResourcePropsBuilder resourceBuilder = ResourceProps.builder();
        NomClient.getInstance().getByNavIdent(navIdent)
                .ifPresent(r -> resourceBuilder
                        .name(r.getFullName())
                        .email(r.getEmail())
                        .navIdent(r.getNavIdent())
                        .resourceType(r.getResourceType())
                        .startDate(r.getStartDate())
                        .endDate(r.getEndDate())
                );

        Vertex resource = Vertex.builder()
                .id(navIdent)
                .label(VertexLabel.Resource)
                .properties(resourceBuilder.build())
                .build();

        return Network.builder()
                .vertex(member)
                .vertex(resource)
                .edge(Edge.builder()
                        .inV(member.getId())
                        .label(EdgeLabel.resourcedBy)
                        .outV(resource.getId())
                        .build())
                .edge(Edge.builder()
                        .inV(member.getId())
                        .label(edgeLabel)
                        .outV(parentId.toString())
                        .build())
                .build();
    }
}
