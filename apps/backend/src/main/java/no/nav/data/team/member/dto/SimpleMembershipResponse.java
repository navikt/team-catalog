package no.nav.data.team.member.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"email", "navIdent", "name", "teams", "productAreas", "clusters"})
public class SimpleMembershipResponse {

    private String email;
    private String navIdent;
    private String name;
    private List<SimpleMembershipObjectResponse> teams;
    private List<SimpleMembershipObjectResponse> productAreas;
    private List<SimpleMembershipObjectResponse> clusters;
}

