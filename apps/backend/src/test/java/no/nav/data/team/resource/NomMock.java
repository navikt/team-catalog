package no.nav.data.team.resource;

import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.domain.ResourceRepository;

import java.util.List;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static no.nav.data.team.TestDataHelper.createResource;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;

public class NomMock {

    public static void init() {
        new Mocker();
    }

    static class Mocker {

        private final StorageService storage = mock(StorageService.class);
        private final ResourceRepository resourceRepository = mock(ResourceRepository.class);
        private final NomClient client = new NomClient(storage, resourceRepository);

        public Mocker() {
            lenient().when(resourceRepository.findByIdents(anyList())).thenReturn(List.of());

            client.add(List.of(
                    createResource("Normann", "Ola", createNavIdent(0)),
                    createResource("Normann", "Kari", createNavIdent(1)),
                    createResource("Doe", "John", createNavIdent(2)),
                    createResource("Doe", "Jane", createNavIdent(3))
            ));
        }
    }
}
