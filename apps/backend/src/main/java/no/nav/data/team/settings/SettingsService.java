package no.nav.data.team.settings;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.RequiredArgsConstructor;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.storage.domain.GenericStorageRepository;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.settings.dto.Settings;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final String SETTINGS = TypeRegistration.typeOf(Settings.class);
    private final GenericStorageRepository repository;

    private final LoadingCache<String, Settings> cache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .build(k -> getSettings());

    public Settings getSettings() {
        return findSettings().getDomainObjectData(Settings.class);
    }

    public Settings getSettingsCached() {
        return cache.get("singleton");
    }

    public Settings updateSettings(Settings settings) {
        Validator.validate(settings);
        GenericStorage settingsStorage = findSettings();
        settingsStorage.setData(JsonUtils.toJsonNode(settings));
        Settings updated = repository.save(settingsStorage).getDomainObjectData(Settings.class);
        cache.put("singleton", updated);
        return updated;
    }

    private GenericStorage findSettings() {
        return repository.findByType(SETTINGS).orElseGet(this::createSettings);
    }

    private GenericStorage createSettings() {
        return repository.save(new GenericStorage(UUID.randomUUID(), SETTINGS, JsonNodeFactory.instance.objectNode()));
    }

}
