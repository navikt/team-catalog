package no.nav.data.team.po.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.shared.dto.Links;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.domain.Role;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({"id", "name", "avdelingNomId", "avdelingNavn", "nomId", "areaType", "description", "slackChannel", "tags", "members", "locations", "status", "changeStamp", "links", "paOwnerGroupNavIdentList","isDefaultArea"})
public class ProductAreaResponse {

    private UUID id;
    private String name;
    private String avdelingNomId;
    private String avdelingNavn;
    private String nomId;
    private AreaType areaType;
    private String description;
    private String slackChannel;
    private List<String> tags;
    private List<MemberResponse> members;
    private List<String> ownerGroupNavidentList;


    private DomainObjectStatus status;
    @Builder.Default
    private boolean isDefaultArea = false;

    private ChangeStampResponse changeStamp;
    private Links links;

    @JsonIgnore
    public List<MemberResponse> getOwnerGroupMembers(){
        return this.members.stream().filter(MemberResponse::hasLeaderRole).toList();
    }

    @JsonIgnore
    public Optional<MemberResponse> getOwnergroupLeaderMember(){
        return this.members.stream().filter(x -> x.getRoles().stream().anyMatch(r -> r.equals(Role.LEADER))).findFirst();
    }

}
