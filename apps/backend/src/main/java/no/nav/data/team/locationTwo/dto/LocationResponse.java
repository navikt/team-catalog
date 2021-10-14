package no.nav.data.team.locationTwo.dto;

import lombok.Builder;
import lombok.Data;
import no.nav.data.team.locationTwo.domain.LocationType;

import java.util.List;

@Data
@Builder
public class LocationResponse {
    String locationCode;
    String locationDescription;
    LocationType locationType;
    List<LocationResponse> subLocations;
}
