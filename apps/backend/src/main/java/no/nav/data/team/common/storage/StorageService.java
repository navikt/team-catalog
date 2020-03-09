package no.nav.data.team.common.storage;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.NotFoundException;
import no.nav.data.team.common.storage.domain.DomainObject;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.storage.domain.GenericStorageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.convert;

@Slf4j
@Service
@Transactional
public class StorageService {

    private final GenericStorageRepository repository;

    public StorageService(GenericStorageRepository repository) {
        this.repository = repository;
    }

    public <T extends DomainObject> T get(UUID uuid, Class<T> type) {
        return getStorage(uuid, type).getDomainObjectData(type);
    }

    public <T extends DomainObject> T save(T object) {
        var storage = object.getId() != null ? getStorage(object.getId(), object.getClass()) : new GenericStorage().generateId();
        storage.setDomainObjectData(object);
        repository.save(storage);
        return object;
    }

    private GenericStorage getStorage(UUID uuid, Class<? extends DomainObject> type) {
        GenericStorage storage = repository.findById(uuid).orElseThrow(() -> new NotFoundException("Couldn't find " + GenericStorage.typeOf(type) + " with id " + uuid));
        storage.validateType(type);
        return storage;
    }

    public <T extends DomainObject> boolean exists(UUID uuid, Class<T> type) {
        return repository.existsByIdAndType(uuid, GenericStorage.typeOf(type));
    }

    public boolean exists(UUID uuid, String type) {
        return repository.existsByIdAndType(uuid, type);
    }

    public <T extends DomainObject> T delete(UUID id, Class<T> type) {
        var storage = getStorage(id, type);
        repository.delete(storage);
        return storage.getDomainObjectData(type);
    }

    public <T extends DomainObject> List<T> getAll(Class<T> type) {
        return convert(repository.findAllByType(GenericStorage.typeOf(type)), gs -> gs.getDomainObjectData(type));
    }

    public <T extends DomainObject> Optional<GenericStorage> getSingleton(Class<T> type) {
        return repository.findByType(GenericStorage.typeOf(type));
    }
}
