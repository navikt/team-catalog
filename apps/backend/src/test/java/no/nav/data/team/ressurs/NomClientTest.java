package no.nav.data.team.ressurs;

import no.nav.data.team.ressurs.domain.Resource;
import no.nav.data.team.ressurs.domain.ResourceType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class NomClientTest {

    private NomClient client = new NomClient();
    private int c = 0;

    @Test
    void searchByName() {
        client.add(List.of(
                createResource("Family", "Given"),
                createResource("Mart", "Guy"),
                createResource("Marty", "Gal"),
                createResource("Hart", "Bob"),
                createResource("Yes Sir", "Heh")
        ));

        assertThat(client.search("mart").stream().map(Resource::getFamilyName))
                .contains("Mart", "Marty");

        assertThat(client.search("Heh").stream().map(Resource::getFamilyName))
                .contains("Yes Sir");

        assertThat(client.search("bob ha").stream().map(Resource::getFamilyName))
                .contains("Hart");
    }

    private Resource createResource(String familyName, String givenName) {
        return Resource.builder()
                .email("a@b.no").familyName(familyName).givenName(givenName).navIdent("S" + (100000 + c++))
                .resourceType(ResourceType.EXTERNAL)
                .build();
    }
}