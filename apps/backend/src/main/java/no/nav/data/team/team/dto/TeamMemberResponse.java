package no.nav.data.team.team.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"navIdent", "name", "role"})
public class TeamMemberResponse {

    private String navIdent;
    private String name;
    private String role;

}
