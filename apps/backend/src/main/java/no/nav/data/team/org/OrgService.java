package no.nav.data.team.org;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.nom.graphql.model.NomNivaaDto;
import no.nav.nom.graphql.model.OrgEnhetsTypeDto;
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
        log.info("Org enhet in direktorat: {}", orgehet);
        if (orgehet.getOrganiseringer().size() > 1)
            throw new IllegalStateException("OrgEnhetDto har mer enn en organisering på enhet over");

        if (isNull(orgehet.getNomNivaa())) {
            var orgenhetOver = orgehet.getOrganiseringer().getFirst();
            if (orgenhetOver.getOrgEnhet() == null) return false;
            return isOrgEnhetInArbeidsomraadeOgDirektorat(orgenhetOver.getOrgEnhet().getId());
        } else return orgehet.getOrgEnhetsType().equals(OrgEnhetsTypeDto.DIREKTORAT) && orgehet.getNomNivaa().equals(NomNivaaDto.ARBEIDSOMRAADE);
    }
}
