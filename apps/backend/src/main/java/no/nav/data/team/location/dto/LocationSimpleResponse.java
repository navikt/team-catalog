package no.nav.data.team.location.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.location.domain.LocationType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
