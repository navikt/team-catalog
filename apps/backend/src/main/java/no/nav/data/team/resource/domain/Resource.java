package no.nav.data.team.resource.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.common.storage.domain.ChangeStamp;
import no.nav.data.team.common.storage.domain.DomainObject;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.resource.dto.ResourceResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resource implements DomainObject {

    private static final LocalDateTime startup = LocalDateTime.now();

    private UUID id;
    private ChangeStamp changeStamp;

    private String key;
    private int partition;
    private long offset;
    private LocalDateTime lastReadTime;

    private String navIdent;
    private String givenName;
    private String familyName;
    private String fullName;
    private String email;
    private ResourceType resourceType;
    private LocalDate startDate;
    private LocalDate endDate;

    private Resource(UUID id) {
        this.id = id;
    }

    public Resource merge(NomRessurs nomRessurs) {
        return new Resource(id).cloneFrom(nomRessurs);
    }

    private Resource cloneFrom(NomRessurs nomRessurs) {
        navIdent = nomRessurs.getNavident();
        givenName = nomRessurs.getFornavn();
        familyName = nomRessurs.getEtternavn();
        fullName = nomRessurs.getFullName();
        email = nomRessurs.getEpost();
        resourceType = ResourceType.fromRessursType(nomRessurs.getRessurstype());
        startDate = nomRessurs.getStartdato();
        endDate = nomRessurs.getSluttdato();

        key = nomRessurs.getKey();
        partition = nomRessurs.getPartition();
        offset = nomRessurs.getOffset();
        lastReadTime = LocalDateTime.now();
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
                .stale(lastReadTime.isBefore(startup) && startup.isBefore(LocalDateTime.now().minusMinutes(10)))
                .build();
    }
}
