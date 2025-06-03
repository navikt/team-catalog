package no.nav.data.team.po.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.team.resource.dto.ResourceResponse;

import java.util.List;

@Data
@Builder
public class PaOwnerGroupResponse {
    private final ResourceResponse ownerResource;
    private final List<ResourceResponse> nomOwnerGroupMemberNavIdList;
    private final List<ResourceResponse> ownerGroupMemberResourceList;


    public PaOwnerGroupResponse(){
        this.ownerResource = null;
        this.nomOwnerGroupMemberNavIdList = List.of();
        this.ownerGroupMemberResourceList = List.of();
    }

    public PaOwnerGroupResponse(ResourceResponse ownerResource, List<ResourceResponse> nomOwnerGroupMemberNavIdList, List<ResourceResponse> ownerGroupMemberResourceList){
        this.ownerResource = ownerResource;
        this.nomOwnerGroupMemberNavIdList = nomOwnerGroupMemberNavIdList;
        this.ownerGroupMemberResourceList = ownerGroupMemberResourceList;
    }

}
