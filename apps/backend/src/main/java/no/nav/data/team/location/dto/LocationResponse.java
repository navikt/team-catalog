package no.nav.data.team.location.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.location.domain.LocationType;

import java.util.List;

@Data
@Builder
public class LocationResponse {
    String code;
    String description;
    String displayName;
    LocationType type;
    List<LocationResponse> subLocations;

    public static LocationResponse convert(Location location){
        return LocationResponse.builder()
                .code(location.getCode())
                .description(location.getDescription())
                .displayName(location.getDisplayName())
                .type(location.getType())
                .subLocations(location.getSubLocations().stream().map(LocationResponse::convert).toList())
                .build();
    }
}
