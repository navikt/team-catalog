package no.nav.data.team.team;

import io.micrometer.core.annotation.Timed;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.MetricUtils.DB_QUERY_TIMED;
import static no.nav.data.common.utils.MetricUtils.QUERY;

public interface TeamRepository extends JpaRepository<GenericStorage, UUID>, TeamRepositoryCustom {

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "TeamRepository.findByProductArea"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where data ->> 'productAreaId' = cast(?1 as text) and type = 'Team'", nativeQuery = true)
    List<GenericStorage> findByProductArea(UUID productAreaId);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "TeamRepository.findByNameLike"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where data ->> 'name' ilike %?1% and type = 'Team'", nativeQuery = true)
    List<GenericStorage> findByNameLike(String name);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "TeamRepository.findByName"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where data ->> 'name' ilike ?1 and type = 'Team'", nativeQuery = true)
    List<GenericStorage> findByName(String name);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "TeamRepository.findUnsentUpdates"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where cast(data -> 'updateSent' as boolean) = false and last_modified_date < now() at time zone 'Europe/Oslo' - interval '5 minute' and type = 'Team'", nativeQuery = true)
    List<GenericStorage> findUnsentUpdates();

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "TeamRepository.getTeamIdsForProductArea"}, percentiles = {.99, .75, .50})
    @Query(value = "select cast(id as text) from generic_storage where data ->> 'productAreaId' = cast(?1 as text) and type = 'Team'", nativeQuery = true)
    List<UUID> getTeamIdsForProductArea(UUID prodAreaId);

    @Modifying
    @Transactional
    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "TeamRepository.setUpdateSent"}, percentiles = {.99, .75, .50})
    @Query(value = "update generic_storage set data = jsonb_set(data, '{updateSent}', 'true', false) where id = ?1 and last_modified_date < now() at time zone 'Europe/Oslo' - interval '5 minute' and type = 'Team'", nativeQuery = true)
    int setUpdateSent(UUID id);

    @Modifying
    @Transactional
    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "TeamRepository.resetSyncFlags"}, percentiles = {.99, .75, .50})
    @Query(value = "update generic_storage "
            + "set data = jsonb_set(data, '{updateSent}', 'false', true) "
            + "where (type = 'ProductArea' or type = 'Team' or type = 'Cluster')", nativeQuery = true)
    int resetSyncFlags();
}
