package no.nav.data.team.resource.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resource {

    private String navIdent;
    private String givenName;
    private String familyName;
    private String email;
    private ResourceType resourceType;
    private LocalDate startDate;

    public String getFullName() {
        return StringUtils.trimToNull(
                StringUtils.trimToEmpty(givenName) + " " + StringUtils.trimToEmpty(familyName)
        );
    }
}
