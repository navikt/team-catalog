package no.nav.data.team.naisteam.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.naisteam.dto.NaisAppResponse;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NaisApp {

    private String name;
    private String zone;

    public NaisAppResponse convertToResponse() {
        return NaisAppResponse.builder().name(name).zone(zone).build();
    }

}
