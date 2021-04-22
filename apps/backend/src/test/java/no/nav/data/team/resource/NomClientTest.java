package no.nav.data.team.resource;

import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.settings.SettingsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static no.nav.data.team.TestDataHelper.createResource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NomClientTest {

    @Mock
    private StorageService storage;
    @Mock
    private SettingsService settingsService;
    @Mock
    private ResourceRepository resourceRepository;
    @InjectMocks
    private NomClient client;

    @Test
    void searchByName() {
        when(resourceRepository.findByIdents(anyList())).thenReturn(List.of());
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
        verify("Andre", "Smarty");
    }

    private void verify(String searchString, String... results) {
        assertThat(client.search(searchString).getContent().stream().map(Resource::getFamilyName))
                .containsExactlyInAnyOrder(results);
    }
}