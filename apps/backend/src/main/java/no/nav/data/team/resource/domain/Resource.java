package no.nav.data.team.resource.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.common.storage.domain.ChangeStamp;
import no.nav.data.team.common.storage.domain.DomainObject;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.resource.dto.ResourceResponse;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resource implements DomainObject {

    private static final ZonedDateTime startup = ZonedDateTime.now();

    private UUID id;
    private ChangeStamp changeStamp;

    private int resourceHashCode;
    private int partition;
    private long offset;
    private ZonedDateTime readTime;
    @JsonIgnore
    private boolean stale;

    private String navIdent;
    private String givenName;
    private String familyName;
    private String fullName;
    private String email;
    private ResourceType resourceType;
    private LocalDate startDate;
    private LocalDate endDate;

    public Resource(NomRessurs nomRessurs) {
        cloneFrom(nomRessurs);
    }

    private void cloneFrom(NomRessurs nomRessurs) {
        resourceHashCode = nomRessurs.hashCode();
        partition = nomRessurs.getPartition();
        offset = nomRessurs.getOffset();
        readTime = ZonedDateTime.now();

        navIdent = nomRessurs.getNavident();
        givenName = nomRessurs.getFornavn();
        familyName = nomRessurs.getEtternavn();
        fullName = nomRessurs.getFullName();
        email = nomRessurs.getEpost();
        resourceType = ResourceType.fromRessursType(nomRessurs.getRessurstype());
        startDate = nomRessurs.getStartdato();
        endDate = nomRessurs.getSluttdato();
    }

    public Resource stale() {
        stale = true;
        return this;
    }

    public ResourceResponse convertToResponse() {
        return ResourceResponse.builder()
                .navIdent(navIdent)
                .givenName(givenName)
                .familyName(familyName)
                .fullName(fullName)
                .email(email)
                .resourceType(resourceType)
                .startDate(startDate)
                .endDate(endDate)
                .stale(stale)
                .build();
    }
}
