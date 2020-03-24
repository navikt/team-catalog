package no.nav.data.team.resource;

import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class NomClientTest {

    private NomClient client = new NomClient();

    @Test
    void searchByName() {
        client.add(List.of(
                createResource("Family", "Given", "S123456"),
                createResource("Mart", "Guy", "S123457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Yes Sir", "Heh", "S123460")
        ));

        assertThat(client.search("mart").getContent().stream().map(Resource::getFamilyName))
                .contains("Mart", "Marty");

        assertThat(client.search("Heh").getContent().stream().map(Resource::getFamilyName))
                .contains("Yes Sir");

        assertThat(client.search("bob ha").getContent().stream().map(Resource::getFamilyName))
                .contains("Hart");
    }

    static Resource createResource(String familyName, String givenName, String ident) {
        return Resource.builder()
                .email("a@b.no").familyName(familyName).givenName(givenName).navIdent(ident)
                .resourceType(ResourceType.EXTERNAL)
                .build();
    }
}