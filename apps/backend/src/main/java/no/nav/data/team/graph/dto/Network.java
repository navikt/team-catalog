package no.nav.data.team.graph.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Network {

    @Singular
    private List<Edge> edges;
    @Singular
    private List<Vertex> vertices;

    public void cleanAndSetPartitionKeys() {
        vertices = vertices.stream()
                .distinct()
                .peek(v -> v.getProperties().setType(v.getId()))
                .collect(Collectors.toList());
    }
}
