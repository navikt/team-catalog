package no.nav.data.team.member.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.team.domain.TeamRole;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"navIdent", "description", "roles", "teamPercent", "startDate", "endDate", "resource"})
public class MemberResponse {

    private String navIdent;
    private String description;
    private List<TeamRole> roles;

    private int teamPercent;
    private LocalDate startDate;
    private LocalDate endDate;

    private ResourceResponse resource;

}
