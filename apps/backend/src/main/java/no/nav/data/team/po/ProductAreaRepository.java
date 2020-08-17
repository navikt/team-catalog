package no.nav.data.team.po;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface ProductAreaRepository extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'name' ilike %?1% and type = 'ProductArea'", nativeQuery = true)
    List<GenericStorage> findByNameLike(String name);

    @Query(value = "select * from generic_storage where data ->> 'name' ilike ?1 and type = 'ProductArea'", nativeQuery = true)
    List<GenericStorage> findByName(String name);

    @Query(value = "select * from generic_storage where cast(data -> 'updateSent' as boolean) = false and last_modified_date < now() at time zone 'Europe/Oslo' - interval '5 minute' and type = 'ProductArea'", nativeQuery = true)
    List<GenericStorage> findUnsentUpdates();

    @Modifying
    @Transactional
    @Query(value = "update generic_storage set data = jsonb_set(data, '{updateSent}', 'true', false) where id = ?1 and last_modified_date < now() at time zone 'Europe/Oslo' - interval '5 minute' and type = 'ProductArea'", nativeQuery = true)
    int setUpdateSent(UUID id);
}
