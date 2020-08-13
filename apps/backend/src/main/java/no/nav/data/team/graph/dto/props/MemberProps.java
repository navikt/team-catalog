package no.nav.data.team.graph.dto.props;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.team.graph.dto.EdgeProps;
import no.nav.data.team.team.domain.TeamRole;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberProps extends EdgeProps {

    private String description;
    private List<TeamRole> roles;

}
