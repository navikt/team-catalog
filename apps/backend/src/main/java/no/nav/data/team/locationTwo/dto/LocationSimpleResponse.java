package no.nav.data.team.locationTwo.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.team.locationTwo.domain.LocationType;

@Data
@Builder
public class LocationSimpleResponse {
    String locationCode;
    String locationDescription;
    LocationType locationType;
}
