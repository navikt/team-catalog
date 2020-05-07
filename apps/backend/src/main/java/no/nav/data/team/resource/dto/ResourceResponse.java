package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.annotations.ApiParam;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.domain.ResourceType;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"navIdent", "givenName", "familyName", "fullName", "email", "resourceType", "startDate", "endDate", "stale"})
public class ResourceResponse {

    private String navIdent;
    private String givenName;
    private String familyName;
    private String fullName;
    private String email;
    private ResourceType resourceType;
    private LocalDate startDate;
    private LocalDate endDate;
    @ApiParam(value = "If true the resource is no longer to be found in NOM")
    private boolean stale;

}
