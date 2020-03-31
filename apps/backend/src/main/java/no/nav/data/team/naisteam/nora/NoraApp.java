package no.nav.data.team.naisteam.nora;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.naisteam.domain.NaisApp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoraApp {

    @JsonProperty("_id")
    private String id;
    private String name;
    private String team;
    private String cluster;
    private String zone;
    private String kilde;
    @JsonProperty("created_at")
    private String createdAt;
    @JsonProperty("updated_at")
    private String updatedAt;

    public NaisApp convertToApp() {
        return NaisApp.builder().name(name).zone(zone).build();
    }
}
