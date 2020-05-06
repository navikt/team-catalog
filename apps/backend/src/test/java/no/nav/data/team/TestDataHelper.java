package no.nav.data.team;

import no.nav.data.team.resource.dto.NomRessurs;

public class TestDataHelper {

    public static String createNavIdent(int i) {
        return "A" + (123456 + i);
    }

    public static NomRessurs createResource(String familyName, String givenName, String ident) {
        return NomRessurs.builder()
                .epost("a@b.no")
                .etternavn(familyName)
                .fornavn(givenName)
                .navident(ident)
                .ressurstype("EKSTERN")
                .build();
    }
}
