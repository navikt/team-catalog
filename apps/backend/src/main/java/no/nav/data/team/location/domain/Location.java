package no.nav.data.team.location.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Location implements DomainObject {

    private UUID id;
    private String locationId;
    private String name;
    private List<Area> areas;
    private ChangeStamp changeStamp;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Area {

        private String id;
        private int x;
        private int y;

    }

}
