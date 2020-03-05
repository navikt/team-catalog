package no.nav.data.team.settings;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.storage.domain.GenericStorageRepository;
import no.nav.data.team.common.utils.JsonUtils;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.settings.dto.Settings;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SettingsService {

    public static final String SETTINGS = "SETTINGS";
    private final GenericStorageRepository repository;

    public SettingsService(GenericStorageRepository repository) {
        this.repository = repository;
    }

    public Settings getSettings() {
        return toObject(findSettings().getData());
    }

    public Settings updateSettings(Settings settings) {
        Validator.validate(settings);
        GenericStorage settingsStorage = findSettings();
        settingsStorage.setData(JsonUtils.toJsonNode(settings));
        return toObject(repository.save(settingsStorage).getData());
    }

    private GenericStorage findSettings() {
        return repository.findByType(SETTINGS).orElseGet(this::createSettings);
    }

    private GenericStorage createSettings() {
        return repository.save(new GenericStorage(UUID.randomUUID(), SETTINGS, JsonNodeFactory.instance.objectNode()));
    }

    private Settings toObject(JsonNode data) {
        return JsonUtils.toObject(data, Settings.class);
    }
}
