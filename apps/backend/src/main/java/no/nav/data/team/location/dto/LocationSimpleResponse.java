package no.nav.data.team.location.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.location.domain.LocationType;

@Data
@Builder
public class LocationSimpleResponse {
    String locationCode;
    String locationDescription;
    LocationType locationType;

    public static LocationSimpleResponse convert(Location location){
        return LocationSimpleResponse.builder()
                .locationCode(location.getLocationCode())
                .locationDescription(location.getLocationDescription())
                .locationType(location.getLocationType())
                .build();
    }
}
