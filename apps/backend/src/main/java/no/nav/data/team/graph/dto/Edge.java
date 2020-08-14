package no.nav.data.team.graph.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Edge {

    private EdgeLabel label;
    private String inV;
    private String outV;

    @Default
    private EdgeProps properties = new EdgeProps();

}
