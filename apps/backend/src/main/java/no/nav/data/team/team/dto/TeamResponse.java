package no.nav.data.team.team.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.team.domain.TeamType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "description", "slackChannel", "productAreaId",
        "teamType", "qaTime", "naisTeams", "members", "tags", "locations", "changeStamp"})
public class TeamResponse {

    private UUID id;
    private String name;
    private String description;
    private String slackChannel;
    private UUID productAreaId;
    private TeamType teamType;
    private LocalDateTime qaTime;
    private List<String> naisTeams;
    private List<MemberResponse> members;
    private List<String> tags;
    private List<Location> locations;
    private ChangeStampResponse changeStamp;

}
