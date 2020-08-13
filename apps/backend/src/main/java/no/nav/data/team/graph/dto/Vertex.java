package no.nav.data.team.graph.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class Vertex {

    private String id;
    private VertexLabel label;
    private VertexProps properties;

    public Vertex(String id, VertexLabel label, VertexProps properties) {
        this.id = label.id(id);
        this.label = label;
        this.properties = properties;
        this.properties.setType(label);
    }
}
