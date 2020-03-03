package no.nav.data.team.settings;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.storage.domain.GenericStorageRepository;
import no.nav.data.team.common.storage.domain.StorageType;
import no.nav.data.team.common.utils.JsonUtils;
import no.nav.data.team.common.validator.RequestValidator;
import no.nav.data.team.settings.dto.Settings;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {

    private final GenericStorageRepository repository;

    public SettingsService(GenericStorageRepository repository) {
        this.repository = repository;
    }

    public Settings getSettings() {
        return toObject(findSettings().getData());
    }

    public Settings updateSettings(Settings settings) {
        validate(settings);
        GenericStorage settingsStorage = findSettings();
        settingsStorage.setData(JsonUtils.toJsonNode(settings));
        return toObject(repository.save(settingsStorage).getData());
    }

    private void validate(Settings settings) {
        RequestValidator.validate("Settings", settings);
    }

    private GenericStorage findSettings() {
        return repository.findByType(StorageType.SETTINGS).orElseGet(this::createSettings);
    }

    private GenericStorage createSettings() {
        return repository.save(GenericStorage.builder().generateId().type(StorageType.SETTINGS).data(JsonNodeFactory.instance.objectNode()).build());
    }

    private Settings toObject(JsonNode data) {
        return JsonUtils.toObject(data, Settings.class);
    }
}
