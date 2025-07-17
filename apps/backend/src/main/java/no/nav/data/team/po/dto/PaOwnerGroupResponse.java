package no.nav.data.team.po.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.team.resource.dto.ResourceResponse;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class PaOwnerGroupResponse {
    private final ResourceResponse ownerResource;
    private final Map<String, String> nomOwnerGroupMemberOrganizationNameMap;
    private final List<ResourceResponse> nomOwnerGroupMemberNavIdList;
    private final List<ResourceResponse> ownerGroupMemberResourceList;


    public PaOwnerGroupResponse(){
        this.ownerResource = null;
        this.nomOwnerGroupMemberOrganizationNameMap = Map.of();
        this.nomOwnerGroupMemberNavIdList = List.of();
        this.ownerGroupMemberResourceList = List.of();
    }

    public PaOwnerGroupResponse(ResourceResponse ownerResource, Map<String, String> nomOwnerGroupMemberOrganizationNameMap, List<ResourceResponse> nomOwnerGroupMemberNavIdList, List<ResourceResponse> ownerGroupMemberResourceList){
        this.ownerResource = ownerResource;
        this.nomOwnerGroupMemberOrganizationNameMap = nomOwnerGroupMemberOrganizationNameMap;
        this.nomOwnerGroupMemberNavIdList = nomOwnerGroupMemberNavIdList;
        this.ownerGroupMemberResourceList = ownerGroupMemberResourceList;
    }

}
