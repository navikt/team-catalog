package no.nav.data.team.location.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.location.domain.LocationType;

import java.util.List;

@Data
@Builder
public class LocationResponse {
    String locationCode;
    String locationDescription;
    LocationType locationType;
    List<LocationResponse> subLocations;

    public static LocationResponse convert(Location location){
        return LocationResponse.builder()
                .locationCode(location.getLocationCode())
                .locationDescription(location.getLocationDescription())
                .locationType(location.getLocationType())
                .subLocations(location.getSubLocations().stream().map(LocationResponse::convert).toList())
                .build();
    }
}
