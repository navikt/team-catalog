package no.nav.data.team.resource;

import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.settings.SettingsService;
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
            ResourceRepository resourceRepository = mock(ResourceRepository.class);
            NomClient client = new NomClient(mock(StorageService.class), mock(SettingsService.class), resourceRepository);
            lenient().when(resourceRepository.findByIdents(anyList())).thenReturn(List.of());

            client.add(List.of(
                    createResource("Normann", "Ola", createNavIdent(100)),
                    createResource("Normann", "Kari", createNavIdent(101)),
                    createResource("Doe", "John", createNavIdent(102)),
                    createResource("Doe", "Jane", createNavIdent(103))
            ));
        }

    }
}
