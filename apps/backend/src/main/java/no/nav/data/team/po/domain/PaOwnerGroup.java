package no.nav.data.team.po.domain;

import lombok.Builder;
import lombok.Getter;
import no.nav.data.team.po.dto.PaOwnerGroupRequest;
import no.nav.data.team.po.dto.PaOwnerGroupResponse;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.dto.ResourceResponse;

import java.util.List;

@Getter
@Builder
public class PaOwnerGroup {
    private final String ownerNavId;
    private final List<String> nomOwnerGroupMemberNavIdList;
    private final List<String> ownerGroupMemberNavIdList;

    public PaOwnerGroup() {
        this.ownerNavId = null;
        this.nomOwnerGroupMemberNavIdList = List.of();
        this.ownerGroupMemberNavIdList = List.of();
    }

    public PaOwnerGroup(String ownerNavId, List<String> nomOwnerGroupMemberNavIdList, List<String> ownerGroupMemberNavIdList) {
        this.ownerNavId = ownerNavId;
        this.nomOwnerGroupMemberNavIdList = nomOwnerGroupMemberNavIdList;
        this.ownerGroupMemberNavIdList = ownerGroupMemberNavIdList;
    }

    public static PaOwnerGroup convertFromRequest(PaOwnerGroupRequest request) {
        if (request == null) return new PaOwnerGroup();

        return PaOwnerGroup.builder()
                .ownerNavId(request.getOwnerNavId())
                .nomOwnerGroupMemberNavIdList(request.getNomOwnerGroupMemberNavIdList())
                .ownerGroupMemberNavIdList(request.getOwnerGroupMemberNavIdList())
                .build();
    }

    public PaOwnerGroupResponse convertToResponse() {
        var builder = PaOwnerGroupResponse.builder();
        var nomClient = NomClient.getInstance();


        if (getOwnerNavId() != null) {
            var ownerResourceOptional = nomClient.getByNavIdent(getOwnerNavId());
            if (ownerResourceOptional.isPresent()) {
                builder.ownerResource(ownerResourceOptional.get().convertToResponse());
            } else {
                builder.ownerResource(ResourceResponse.builder().navIdent(getOwnerNavId()).stale(true).build());
            }
        }

        var ownerMemberResourceResponses = ownerGroupMemberNavIdList.stream().map(
                memberNavId -> {
                    var optionalRes = nomClient.getByNavIdent(memberNavId);
                    if (optionalRes.isPresent()) {
                        return optionalRes.get().convertToResponse();
                    } else {
                        return ResourceResponse.builder().navIdent(memberNavId).stale(true).build();
                    }
                }
        ).toList();

        var nomOwnerMemberResourceResponses = nomOwnerGroupMemberNavIdList.stream().map(
                memberNavId -> {
                    var optionalRes = nomClient.getByNavIdent(memberNavId);
                    if (optionalRes.isPresent()) {
                        return optionalRes.get().convertToResponse();
                    } else {
                        return ResourceResponse.builder().navIdent(memberNavId).stale(true).build();
                    }
                }
        ).toList();

        builder.ownerGroupMemberResourceList(ownerMemberResourceResponses);
        builder.nomOwnerGroupMemberNavIdList(nomOwnerMemberResourceResponses);

        return builder.build();
    }
}
