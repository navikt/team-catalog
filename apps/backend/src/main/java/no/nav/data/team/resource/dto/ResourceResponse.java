package no.nav.data.team.resource.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.dto.Links;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"navIdent", "givenName", "familyName", "fullName", "email", "onLeave", "resourceType", "startDate", "endDate", "stale", "links"})
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
    private boolean onLeave;
    @Nullable
    private ResourceType resourceType;
    @Nullable
    private LocalDate startDate;
    @Nullable
    private LocalDate endDate;
    @Parameter(description = "If true the resource is no longer to be found in NOM")
    private boolean stale;

    private Links links;

}
