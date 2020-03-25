package no.nav.data.team;

import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceType;

public class TestDataHelper {

    public static String createNavIdent(int i) {
        return "A" + (123456 + i);
    }

    public static Resource createResource(String familyName, String givenName, String ident) {
        return Resource.builder()
                .email("a@b.no")
                .familyName(familyName)
                .givenName(givenName)
                .navIdent(ident)
                .resourceType(ResourceType.EXTERNAL)
                .build();
    }
}
