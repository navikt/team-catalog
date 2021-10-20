package no.nav.data.team.team.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.team.contact.domain.ContactAddress;
import no.nav.data.team.location.dto.LocationSimpleResponse;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.team.domain.TeamType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "description", "slackChannel", "contactPersonIdent", "productAreaId",
        "teamOwnerIdent", "clusterIds",
        "teamType", "qaTime", "naisTeams", "members", "tags", "location", "changeStamp", "links"})
public class TeamResponse {

    private UUID id;
    private String name;
    private String description;
    private String slackChannel;
    private String contactPersonIdent;
    private List<ContactAddress> contactAddresses;
    private UUID productAreaId;
    private String teamOwnerIdent;
    private List<UUID> clusterIds;
    private TeamType teamType;
    private LocalDateTime qaTime;
    private List<String> naisTeams;
    private List<MemberResponse> members;
    private List<String> tags;
    private LocationSimpleResponse location;

    private ChangeStampResponse changeStamp;
    private Links links;

}
