package no.nav.data.team.graph.dto.props;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import no.nav.data.team.graph.dto.VertexProps;
import no.nav.data.team.team.domain.TeamType;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeamProps extends VertexProps {

    private String name;
    private String description;
    private String slackChannel;
    private TeamType teamType;
    private List<String> naisTeams;
    private List<String> tags;
    private LocalDateTime lastChanged;
}
