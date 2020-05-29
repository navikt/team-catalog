package no.nav.data.team.graph.dto.props;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.team.graph.dto.VertexProps;
import no.nav.data.team.resource.domain.ResourceType;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceProps extends VertexProps {

    private String navIdent;
    private String name;
    private String email;
    private ResourceType resourceType;
    private LocalDate startDate;
    private LocalDate endDate;

}
