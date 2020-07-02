package no.nav.data.team.settings;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.settings.dto.Settings;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SettingsService {

    public static final String SETTINGS = TypeRegistration.typeOf(Settings.class);
    private final GenericStorageRepository repository;

    public SettingsService(GenericStorageRepository repository) {
        this.repository = repository;
    }

    public Settings getSettings() {
        return findSettings().getDomainObjectData(Settings.class);
    }

    public Settings updateSettings(Settings settings) {
        Validator.validate(settings);
        GenericStorage settingsStorage = findSettings();
        settingsStorage.setData(JsonUtils.toJsonNode(settings));
        return repository.save(settingsStorage).getDomainObjectData(Settings.class);
    }

    private GenericStorage findSettings() {
        return repository.findByType(SETTINGS).orElseGet(this::createSettings);
    }

    private GenericStorage createSettings() {
        return repository.save(new GenericStorage(UUID.randomUUID(), SETTINGS, JsonNodeFactory.instance.objectNode()));
    }

}
