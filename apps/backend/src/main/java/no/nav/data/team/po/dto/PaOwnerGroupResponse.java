package no.nav.data.team.po.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.ToString;


import java.util.List;

@Data
//@Getter
@Builder
public class PaOwnerGroupResponse {
    private final String ownerNavId;
    private final List<String> ownerGroupMemberNavIdList;

    public PaOwnerGroupResponse(){
        this.ownerNavId = null;
        this.ownerGroupMemberNavIdList = List.of();
    }

    public PaOwnerGroupResponse(String ownerNavId, List<String> ownerGroupMemberNavIdList){
        this.ownerNavId = ownerNavId;
        this.ownerGroupMemberNavIdList = ownerGroupMemberNavIdList;
    }

}
