package no.nav.data.team.po.domain;

import lombok.Builder;
import lombok.Getter;
import no.nav.data.team.po.dto.PaOwnerGroupRequest;
import no.nav.data.team.po.dto.PaOwnerGroupResponse;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.dto.ResourceResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class PaOwnerGroup {
    private final String ownerNavId;
    private final Map<String, String> nomOwnerGroupMemberOrganizationNameMap;
    private final List<String> nomOwnerGroupMemberNavIdList;
    private final List<String> ownerGroupMemberNavIdList;

    public PaOwnerGroup() {
        this.ownerNavId = null;
        this.nomOwnerGroupMemberOrganizationNameMap = Map.of();
        this.nomOwnerGroupMemberNavIdList = List.of();
        this.ownerGroupMemberNavIdList = List.of();
    }

    public PaOwnerGroup(String ownerNavId, Map<String, String> nomOwnerGroupMemberOrganizationNameMap, List<String> nomOwnerGroupMemberNavIdList, List<String> ownerGroupMemberNavIdList) {
        this.ownerNavId = ownerNavId;
        this.nomOwnerGroupMemberOrganizationNameMap = nomOwnerGroupMemberOrganizationNameMap;
        this.nomOwnerGroupMemberNavIdList = nomOwnerGroupMemberNavIdList;
        this.ownerGroupMemberNavIdList = ownerGroupMemberNavIdList;
    }

    public static PaOwnerGroup convertFromRequest(PaOwnerGroupRequest request) {
        if (request == null) return new PaOwnerGroup();

        return PaOwnerGroup.builder()
                .ownerNavId(request.getOwnerNavId())
                .nomOwnerGroupMemberOrganizationNameMap(request.getNomOwnerGroupMemberOrganizationNameMap())
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

        var nomOwnerGroupMemberOrganizationNameMap = getNomOwnerGroupMemberOrganizationNameMap();

        var ownerMemberResourceResponses = ownerGroupMemberNavIdList != null && !ownerGroupMemberNavIdList.isEmpty() ? ownerGroupMemberNavIdList.stream().map(
                memberNavId -> {
                    var optionalRes = nomClient.getByNavIdent(memberNavId);
                    if (optionalRes.isPresent()) {
                        return optionalRes.get().convertToResponse();
                    } else {
                        return ResourceResponse.builder().navIdent(memberNavId).stale(true).build();
                    }
                }
        ).toList() : new ArrayList<ResourceResponse>();

        var nomOwnerMemberResourceResponses = nomOwnerGroupMemberNavIdList != null && !nomOwnerGroupMemberNavIdList.isEmpty() ? nomOwnerGroupMemberNavIdList.stream().map(
                memberNavId -> {
                    var optionalRes = nomClient.getByNavIdent(memberNavId);
                    if (optionalRes.isPresent()) {
                        return optionalRes.get().convertToResponse();
                    } else {
                        return ResourceResponse.builder().navIdent(memberNavId).stale(true).build();
                    }
                }
        ).toList() : new ArrayList<ResourceResponse>();

        builder.ownerGroupMemberResourceList(ownerMemberResourceResponses);
        builder.nomOwnerGroupMemberNavIdList(nomOwnerMemberResourceResponses);
        builder.nomOwnerGroupMemberOrganizationNameMap(nomOwnerGroupMemberOrganizationNameMap);


        return builder.build();
    }
}
