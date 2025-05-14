package no.nav.data.team.org;

import no.nav.data.team.resource.NomGraphClient;
import no.nav.nom.graphql.model.NomNivaaDto;
import no.nav.nom.graphql.model.OrgEnhetsTypeDto;
import org.springframework.stereotype.Service;

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

        if (orgehet.getOrgEnhetsType().equals(OrgEnhetsTypeDto.DIREKTORAT) && orgehet.getNomNivaa().equals(NomNivaaDto.ARBEIDSOMRAADE)) {
            return true;
        } else {
            var orgenhetOver = orgehet.getOrganiseringer().getFirst();
            if (orgenhetOver.getOrgEnhet() == null) return false;
            return isOrgEnhetInArbeidsomraadeOgDirektorat(orgenhetOver.getOrgEnhet().getId());
        }
    }
}
