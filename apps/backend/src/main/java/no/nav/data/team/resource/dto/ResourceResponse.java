package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.annotations.ApiParam;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.domain.ResourceType;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"navIdent", "givenName", "familyName", "fullName", "email", "resourceType", "startDate", "endDate", "stale"})
public class ResourceResponse {

    private String navIdent;
    @Nullable
    private String givenName;
    @Nullable
    private String familyName;
    @Nullable
    private String fullName;
    @Nullable
    private String email;
    @Nullable
    private ResourceType resourceType;
    @Nullable
    private LocalDate startDate;
    @Nullable
    private LocalDate endDate;
    @ApiParam(value = "If true the resource is no longer to be found in NOM")
    private boolean stale;

}
