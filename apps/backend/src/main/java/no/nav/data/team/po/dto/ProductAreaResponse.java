package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.domain.AreaType;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "areaType", "description", "slackChannel", "tags", "members", "locations", "changeStamp"})
public class ProductAreaResponse {

    private UUID id;
    private String name;
    private AreaType areaType;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private List<MemberResponse> members;
    private List<Location> locations;
    private ChangeStampResponse changeStamp;

}
