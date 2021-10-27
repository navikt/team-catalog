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
    String code;
    LocationType type;
    String description;
    String displayName;

    public static LocationSimpleResponse convert(Location location){
        return LocationSimpleResponse.builder()
                .code(location.getCode())
                .description(location.getDescription())
                .type(location.getType())
                .displayName(location.getDisplayName())
                .build();
    }
}
