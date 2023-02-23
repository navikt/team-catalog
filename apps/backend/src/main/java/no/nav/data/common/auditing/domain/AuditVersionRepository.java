package no.nav.data.common.auditing.domain;

import io.micrometer.core.annotation.Timed;
import no.nav.data.common.auditing.dto.AuditMetadata;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.notify.domain.TeamAuditMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.MetricUtils.DB_QUERY_TIMED;
import static no.nav.data.common.utils.MetricUtils.QUERY;

@Repository
public interface AuditVersionRepository extends JpaRepository<AuditVersion, UUID> {

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.findByTable"}, percentiles = {.99, .75, .50})
    Page<AuditVersion> findByTable(String table, Pageable pageable);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.findByTableIdOrderByTimeDesc"}, percentiles = {.99, .75, .50})
    List<AuditVersion> findByTableIdOrderByTimeDesc(String tableId);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.findByTableIdOrderByTimeDescLimitOne"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from audit_version where table_id = ?1 order by time desc limit 1", nativeQuery = true)
    AuditVersion findByTableIdOrderByTimeDescLimitOne(String tableId);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.getAllMetadataAfter"}, percentiles = {.99, .75, .50})
    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version "
            + "where time > (select time from audit_version where audit_id = ?1) "
            + "and (table_name = 'Team' or table_name = 'ProductArea') "
            + "order by time", nativeQuery = true)
    List<AuditMetadata> getAllMetadataAfter(UUID id);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.getTeamMetadataBefore"}, percentiles = {.99, .75, .50})
    @Query(value = """
            select distinct on (table_id)
             cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId,
             data #>> '{data,productAreaId}' as productAreaId
             from audit_version
             where table_name = 'Team'
                and action <> 'DELETE'
                and time < ?1
             order by table_id, time desc
            """, nativeQuery = true)
    List<TeamAuditMetadata> getTeamMetadataBefore(LocalDateTime time);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.getTeamMetadataBetween"}, percentiles = {.99, .75, .50})
    @Query(value = """
            select distinct on (table_id)
             cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId,
             data #>> '{data,productAreaId}' as productAreaId
             from audit_version
             where table_name = 'Team'
              and action <> 'DELETE'
              and time >= ?1
              and time <= ?2
             order by table_id, time desc
             """,
            nativeQuery = true)
    List<TeamAuditMetadata> getTeamMetadataBetween(LocalDateTime start, LocalDateTime end);


    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.getMetadataByIds"}, percentiles = {.99, .75, .50})
    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version where audit_id in ?1", nativeQuery = true)
    List<AuditMetadata> getMetadataByIds(List<UUID> uuids);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.getPreviousAuditIdFor"}, percentiles = {.99, .75, .50})
    @Query(value = "select cast(audit_id as text) from audit_version "
            + "where table_id = (select table_id from audit_version where audit_id = ?1) "
            + "and time < (select time from audit_version where audit_id = ?1) "
            + "order by time desc limit 1", nativeQuery = true)
    String getPreviousAuditIdFor(UUID id);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.lastAuditForObject"}, percentiles = {.99, .75, .50})
    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version "
            + "where table_id = cast(?1 as text) order by time desc limit 1", nativeQuery = true)
    AuditMetadata lastAuditForObject(UUID uuid);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuditVersionRepository.findByTimeBetween"}, percentiles = {.99, .75, .50})
    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId"
            + " from audit_version where time between ?1 and ?2 "
            + " and (table_name = 'Team' or table_name = 'ProductArea') "
            + " order by time"
            , nativeQuery = true)
    List<AuditMetadata> findByTimeBetween(LocalDateTime start, LocalDateTime end);
}
