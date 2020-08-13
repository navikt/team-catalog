package no.nav.data.team.graph.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VertexProps {

    /** partition key */
    private VertexLabel type;
}
