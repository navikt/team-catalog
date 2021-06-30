package no.nav.data.team.po.domain;

import lombok.Builder;
import lombok.Getter;
import no.nav.data.team.po.dto.PaOwnerGroupRequest;
import no.nav.data.team.po.dto.PaOwnerGroupResponse;

import java.util.List;

@Getter
@Builder
public class PaOwnerGroup {
    private final String ownerNavId;
    private final List<String> ownerGroupMemberNavIdList;

    public PaOwnerGroup(){
        this.ownerNavId = null;
        this.ownerGroupMemberNavIdList = List.of();
    }

    public PaOwnerGroup(String ownerNavId, List<String> ownerGroupMemberNavIdList){
        this.ownerNavId = ownerNavId;
        this.ownerGroupMemberNavIdList = ownerGroupMemberNavIdList;
    }

    public PaOwnerGroupResponse convertToResponse() {
        return PaOwnerGroupResponse.builder().ownerNavId(this.ownerNavId)
                .ownerGroupMemberNavIdList(this.ownerGroupMemberNavIdList)
                .build();
    }

    public static PaOwnerGroup convertFromRequest(PaOwnerGroupRequest request){
        if(request == null) return new PaOwnerGroup();

        return PaOwnerGroup.builder()
                .ownerNavId(request.getOwnerNavId())
                .ownerGroupMemberNavIdList(request.getOwnerGroupMemberNavIdList())
                .build();
    }
}
