package no.nav.data.team.resource.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceType;

import java.time.LocalDate;

@SuppressWarnings("SpellCheckingInspection")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NomRessurs {

    private String personident;
    private String navident;
    private String ressurstype;
    private String fornavn;
    private String etternavn;
    private String epost;
    private LocalDate startdato;
    private LocalDate sluttdato;

    public Resource convertToDomain() {
        return Resource.builder()
                .navIdent(getNavident())
                .givenName(getFornavn())
                .familyName(getEtternavn())
                .email(getEpost())
                .resourceType(ResourceType.fromRessursType(getRessurstype()))
                .build();
    }
}
