package no.nav.data.team.cluster.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.shared.domain.DomainObjectStatus;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "description", "slackChannel", "tags", "productAreaId", "members", "status", "changeStamp", "links"})
public class ClusterResponse {

    private UUID id;
    private String name;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private UUID productAreaId;
    private List<MemberResponse> members;

    private DomainObjectStatus status;

    private ChangeStampResponse changeStamp;
    private Links links;

}
