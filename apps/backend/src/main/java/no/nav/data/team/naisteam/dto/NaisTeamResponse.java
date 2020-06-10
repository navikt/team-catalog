package no.nav.data.team.naisteam.dto;


import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "name", "description", "slack", "members", "apps"})
public class NaisTeamResponse {

    private String id;
    private String name;
    private String description;
    private String slack;
    private List<NaisMemberResponse> members;
    private List<NaisAppResponse> apps;

}
