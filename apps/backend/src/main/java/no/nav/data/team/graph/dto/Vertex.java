package no.nav.data.team.graph.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Vertex {

    private String id;
    private VertexLabel label;
    private VertexProps properties;

}
