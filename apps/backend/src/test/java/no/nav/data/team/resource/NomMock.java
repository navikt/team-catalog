package no.nav.data.team.resource;

import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.domain.ResourceRepository;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.Extension;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.util.List;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static no.nav.data.team.TestDataHelper.createResource;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;

public class NomMock implements Extension, BeforeAllCallback {

    @Override
    public void beforeAll(ExtensionContext context) throws Exception {
        new Mocker();
    }

    static class Mocker {

        public Mocker() {
            NomClient client;
            ResourceRepository resourceRepository = mock(ResourceRepository.class);
            if (NomClient.getInstance() == null) {
                client = new NomClient(mock(StorageService.class), resourceRepository);
            } else {
                client = NomClient.getInstance();
            }
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
