package no.nav.data.team.graph.dto.props;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.team.graph.dto.VertexProps;

@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaMemberProps extends VertexProps {

    private String navIdent;
    private String description;

}
