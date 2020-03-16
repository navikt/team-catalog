package no.nav.data.team.team;

import no.nav.data.team.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'productAreaId' = cast(?1 as text) and type = 'Team'", nativeQuery = true)
    List<GenericStorage> findByProductArea(UUID productAreaId);

    @Query(value = "select * from generic_storage where data -> 'updateSent' = false and last_modified_date < now() - interval '30 minute' and type = 'Team'", nativeQuery = true)
    List<GenericStorage> findUnsentUpdates();

    @Query(value = "update generic_storage set data = jsonb_set(data, '{updateSent}', 'true', false) where id = ?1 and last_modified_date < ?2 and type = 'Team'", nativeQuery = true)
    int setUpdateSent(UUID id, LocalDateTime time);
}
