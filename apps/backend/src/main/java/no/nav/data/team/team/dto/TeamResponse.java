package no.nav.data.team.team.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.team.domain.TeamType;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "description", "slackChannel", "productAreaId", "teamLeader",
        "teamType", "teamLeadQA", "naisTeams", "members"})
public class TeamResponse {

    private UUID id;
    private String name;
    private String description;
    private String slackChannel;
    private String productAreaId;
    private String teamLeader;
    private TeamType teamType;
    private boolean teamLeadQA;
    private List<String> naisTeams;
    private List<TeamMemberResponse> members;
}
