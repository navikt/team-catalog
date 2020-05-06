package no.nav.data.team.resource;

import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.domain.ResourceRepository;
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
    private ResourceRepository resourceRepository;
    @InjectMocks
    private NomClient client;

    @Test
    void searchByName() {
        when(resourceRepository.findByIdents(anyList())).thenReturn(List.of());
        client.add(List.of(
                createResource("Family", "Given", "S123456"),
                createResource("Mart", "Guy", "S123457"),
                createResource("Marty", "Gal", "S123458"),
                createResource("Hart", "Bob", "S123459"),
                createResource("Yes Sir", "Heh", "S123460"),
                createResource("Yes Sir", "Heh", "S123460")
        ));

        assertThat(client.search("mart").getContent().stream().map(Resource::getFamilyName))
                .containsExactlyInAnyOrder("Mart", "Marty");

        assertThat(client.search("bob ha").getContent().stream().map(Resource::getFamilyName))
                .containsExactly("Hart");

        // Make sure same ident does not cause duplicate
        assertThat(client.search("Heh").getContent().stream().map(Resource::getFamilyName))
                .containsExactly("Yes Sir");

    }
}