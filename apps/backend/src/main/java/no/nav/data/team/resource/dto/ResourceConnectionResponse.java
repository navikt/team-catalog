package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"navIdent"})
public class ResourceConnectionResponse {

    private String navIdent;
    private List<Unit> units;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Unit {

        private String id;
        private String name;
        private ResourceResponse leader;
        private LocalDate validFrom;
        private LocalDate validTo;
        private Unit parentUnit;
    }

}
