package no.nav.data.team.location.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.team.location.domain.Location;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LocationSimplePathResponse extends LocationSimpleResponse {
    LocationSimplePathResponse parent;

    public static LocationSimplePathResponse convert(Location location){
        return location != null ? LocationSimplePathResponse.builder()
                .code(location.getCode())
                .description(location.getDescription())
                .type(location.getType())
                .displayName(location.getDisplayName())
                .parent(convert(location.getParent()))
                .build() : null;
    }
}
