package no.nav.data.team.resource;

import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.settings.SettingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static no.nav.data.team.TestDataHelper.createResource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NomClientTest {

    @Mock
    private StorageService storage;
    @Mock
    private SettingsService settingsService;
    @Mock
    private ResourceRepository resourceRepository;

    private NomClient client;

    @BeforeEach
    void setup() {
        client = new NomClient(storage, settingsService, resourceRepository);
        client.clear();
    }

    private void verify(String searchString, String... results) {
        List<Resource> content = client.search(searchString).getContent();
        assertThat(content.stream().map(Resource::getFamilyName))
                .containsExactly(results);
    }

    //@Test
    void searchByName() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        NomRessurs otherResourceType = createResource("Other", "Some", "S123401");
        client.add(List.of(
                createResource("Family", "Given", "S123456"),
                createResource("Mart", "Guy", "S123457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Yes Sir", "Hehe", "S123460"),
                createResource("Yes Sir", "Hehe", "S123460"),
                createResource("Smarty", "André", "S123461"),
                otherResourceType
        ));
        otherResourceType.setRessurstype("ANNEN_STAT");
        client.add(List.of(otherResourceType));

        verify("mart", "Mart", "Marty");
        verify("bob har", "Hart");

        // Make sure same ident does not cause duplicate
        verify("Hehe", "Yes Sir");

        // ResourceType.OTHER shouldn't be searchable
        verify("Other");

        // Phonetic
        verify("smart", "Smarty");
        verify("Andrea", "Smarty");
    }

    @Test
    void searchByNameSimple2() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Family", "Given", "S123456")
        ));
        var searchString = "Given";
        List<Resource> content = client.search(searchString).getContent();

        assertThat(content).hasSize(1);
        assertThat(content.get(0).getNavIdent()).isEqualTo("S123456");

    }


    @Test
    void searchByNameSimple() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        NomRessurs otherResourceType = createResource("Other", "Some", "S123401");
        client.add(List.of(
                createResource("Family", "Given", "S123456"),
                createResource("Mart", "Guy", "S123457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Yes Sir", "Hehe", "S123460"),
                createResource("Yes Sir", "Hehe", "S123460"),
                createResource("Smarty", "André", "S123461"),
                otherResourceType
        ));

        verify("mart", "Mart", "Marty");
        verify("bob har", "Hart");
        verify("sir", "Yes Sir");
        verify("yess", "Yes Sir");
        verify("bob", "Hart");
    }

    /*@Test
    void annenStatNotSearchable() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        NomRessurs otherResourceType = createResource("Other", "Some", "S123401");
        client.add(List.of(otherResourceType));

        otherResourceType.setRessurstype("ANNEN_STAT");
        client.add(List.of(otherResourceType));

        // ResourceType.OTHER shouldn't be searchable
        verify("Other");
    }*/

    @Test
    void searchByNamePhonetic() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Mart", "Gely", "S123457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Hannoverday", "Barbara", "S123460"),
                createResource("Smarty", "André", "S123461")
        ));

        // Phonetic
        verify("smart", "Smarty");
        verify("Andrea", "Smarty");
        verify("Gil", "Mart", "Marty");
        verify("barrbarae", "Hannoverday");
    }

    @Test
    void makeSureSameIdentDoesNotCauseDuplicate() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Yes Sir", "Hehe", "S123460"),
                createResource("Yes Sir", "Hehe", "S123460")
        ));

        // Make sure same ident does not cause duplicate
        verify("Hehe", "Yes Sir");
    }

    @Test
    void segmentSearchByName() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Mart", "Guy", "S123457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Smarty", "André", "S123461"),
                createResource("Smartyer", "André martus", "S123462")

        ));

        // segment included in result
        verify("mar", "Mart", "Marty", "Smartyer");
    }


    @Test
    void segmentSearchByName2() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Peterson", "Andrew", "S123457"),
                createResource("Hannoverday", "Barbara", "S123458"),
                createResource("Lumberhill", "Bobby", "S123459"),
                createResource("Smarty", "André", "S123461"),
                createResource("Smartyer", "André martus", "S123462")

        ));

        // segment included in result
        verify("andr", "Peterson", "Smarty", "Smartyer");
        verify("bob", "Lumberhill");
        verify("sma", "Smarty", "Smartyer");
        verify("barb", "Hannoverday");
    }

    @Test
    void fullNameSearch() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Peterson", "Andrew", "S123457"),
                createResource("Hannoverday", "Barbara", "S123458"),
                createResource("Lumberhill", "Bobby", "S123459"),
                createResource("Smarty", "André", "S123461"),
                createResource("Smartyer", "André martus", "S123462")

        ));

        verify("andrew Peterson", "Peterson", "Smarty", "Smartyer");
        verify("barbarra hannovrdai", "Hannoverday");
        verify("bob lumberill", "Lumberhill");
        // ideally this is the ordering. need to handle accents better
        //verify("andre smarty", "Smarty", "Smartyer", "Peterson");
        //verify("andre martus smartyer",  "Smartyer", "Smarty","Peterson");
        verify("andre smarty", "Smarty", "Peterson", "Smartyer");
        verify("andre martus smartyer", "Smartyer", "Smarty", "Peterson");

    }

    @Test
    void badInputHandledOk() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Peterson", "Andrew", "S123457")
        ));

        verify("  andrew ¤¤##\\[}", "Peterson");
        verify("  andrew ¤¤\\n\\t##\\[}", "Peterson");
        verify("x");
    }

    @Test
    void orderingTest() {
        when(storage.getAll(Resource.class)).thenReturn(List.of());
        client.add(List.of(
                createResource("Peterson", "Andrew Bobby", "S123457"),
                createResource("Hannoverday", "Barbara", "S123458"),
                createResource("Lumberhill", "Bobby", "S123459"),
                createResource("Smarty", "André", "S123461"),
                createResource("Smartyer", "André martus", "S123462")

        ));

        verify("andrew bobby mar", "Peterson", "Lumberhill", "Smartyer", "Smarty");
        verify("bobby andrew", "Peterson", "Lumberhill", "Smarty", "Smartyer");

    }
}