package no.nav.data.team.member.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.team.dto.TeamResponse;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"teams", "productAreas"})
public class MembershipResponse {

    private List<TeamResponse> teams;
    private List<ProductAreaResponse> productAreas;
}
