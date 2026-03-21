package no.nav.data.team.org;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.nom.graphql.model.*;
import org.springframework.stereotype.Service;

import static java.util.Objects.isNull;

@Slf4j
@Service
public class OrgService {
    NomGraphClient nomGraphClient;

    public OrgService(NomGraphClient nomGraphClient) {
        this.nomGraphClient = nomGraphClient;
    }

    public boolean isOrgEnhetInArbeidsomraadeOgDirektorat(String nomId) {
        var optionalOrgEnhetDto = nomGraphClient.getOrgenhetMedOverOrganisering(nomId);
        if (optionalOrgEnhetDto.isEmpty()) return false;

        var orgehet = optionalOrgEnhetDto.get();
        if (orgehet.getOrganiseringer().size() > 1)
            throw new IllegalStateException("OrgEnhetDto har mer enn en organisering på enhet over");

        if (isNull(orgehet.getNomNivaa())) {
            var orgenhetOver = orgehet.getOrganiseringer().stream().findFirst().map(OrganiseringDto::getOrgEnhet).orElse(null);
            if (orgenhetOver == null) return false;
            return isOrgEnhetInArbeidsomraadeOgDirektorat(orgenhetOver.getId());
        } else return (orgehet.getOrgEnhetsType().equals(OrgEnhetsTypeDto.DIREKTORAT) || orgehet.getOrgEnhetsType().equals(OrgEnhetsTypeDto.KLAGEINSTANS))
                && orgehet.getNomNivaa().equals(NomNivaaDto.ARBEIDSOMRAADE);
    }

    public String getAvdelingNomId(String nomId) {
        if (nomId == null) return null;
        var optionalOrgEnhetDto = nomGraphClient.getOrgenhetMedOverOrganisering(nomId);
        if (optionalOrgEnhetDto.isEmpty()) return null;

        var orgenhet = optionalOrgEnhetDto.get();
        if (orgenhet.getOrganiseringer().size() > 1)
            throw new IllegalStateException("OrgEnhetDto har mer enn en organisering på enhet over");

        if (orgenhet.getOrganiseringer().isEmpty()) throw new IllegalStateException("OrgEnhetDto har ingen organiseringer på enhet over");
        var orgenhetOver = orgenhet.getOrganiseringer().getFirst().getOrgEnhet();

        if (orgenhetOver.getNomNivaa() != null
            && orgenhetOver.getNomNivaa().equals(NomNivaaDto.ARBEIDSOMRAADE)
            && orgenhetOver.getOrgEnhetsType() != null
                && (orgenhetOver.getOrgEnhetsType().equals(OrgEnhetsTypeDto.DIREKTORAT) || orgenhetOver.getOrgEnhetsType().equals(OrgEnhetsTypeDto.KLAGEINSTANS))) {
            return orgenhetOver.getId();
        }
        throw new NotFoundException("OrgEnhetDto har ikke arbeidsomraade og direktorat på enhet over");
    }

    public OrgEnhetDto getOrgEnhetOgUnderEnheter(String nomId) {
        if (nomId == null) return null;
        log.info("nomId: {}", nomId);
        var orgEnhetDto = nomGraphClient.getOrgEnhetMedUnderOrganiseringOgLedere(nomId);
        log.info("OrgEnhetDto: {}", orgEnhetDto);
        return orgEnhetDto;
    }
}
