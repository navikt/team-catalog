package no.nav.data.team.location;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface LocationRepository extends CrudRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'floorId' = ?1 and type = 'Floor'", nativeQuery = true)
    Optional<GenericStorage> findFloorByFloorId(String floorId);

    @Query(value = "select * from generic_storage where data ->> 'floorId' = ?1 and type = 'FloorImage'", nativeQuery = true)
    Optional<GenericStorage> findFloorImageByFloorId(String floorId);

}
