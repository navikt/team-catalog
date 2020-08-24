package no.nav.data.team.location.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Floor implements DomainObject {

    private UUID id;
    private String floorId;
    private String name;
    private String locationImageId;

    @Default
    private double dimY = 1;
    @Default
    private double bubbleScale = 1;

    private ChangeStamp changeStamp;

}
