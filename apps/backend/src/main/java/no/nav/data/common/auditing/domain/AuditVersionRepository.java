package no.nav.data.common.auditing.domain;

import no.nav.data.common.auditing.dto.AuditMetadata;
import no.nav.data.common.notify.domain.AuditMetadataPa;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.data.domain.ExampleMatcher.matching;

@Repository
public interface AuditVersionRepository extends JpaRepository<AuditVersion, UUID> {

    Page<AuditVersion> findByTable(String table, Pageable pageable);

    List<AuditVersion> findByTableIdOrderByTimeDesc(String tableId);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version "
            + "where time > (select time from audit_version where audit_id = ?1) "
            + "and (table_name = 'Team' or table_name = 'ProductArea') "
            + "order by time", nativeQuery = true)
    List<AuditMetadata> getAllMetadataAfter(UUID id);

    @Query(value = """
             select * from (
                select distinct on (table_id)
                    cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId,
                    data #>> '{data,productAreaId}' as productAreaId
                               from audit_version
                               where table_name = 'Team'
                                 and time < ?2
                                 order by table_id, time desc
             ) as pa_status
             where pa_status.productAreaId = cast(?1 as text)
            """, nativeQuery = true)
    List<AuditMetadataPa> getPrevMetadataForTeamsByProductArea(UUID id, LocalDateTime start);

    @Query(value = """
             select distinct on (table_id) 
                  cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId,
                  data #>> '{data,productAreaId}' as productAreaId
             from audit_version
             where table_id in (select distinct table_id
                               from audit_version
                               where table_name = 'Team'
                                 and data #>> '{data,productAreaId}' = cast(?1 as text)
                                 and time between ?2 and ?3
             )
             order by table_id, time desc
            """, nativeQuery = true)
    List<AuditMetadataPa> getCurrMetadataForTeamsByProductArea(UUID id, LocalDateTime start, LocalDateTime end);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version where audit_id in ?1", nativeQuery = true)
    List<AuditMetadata> getMetadataByIds(List<UUID> uuids);

    @Query(value = "select cast(audit_id as text) from audit_version "
            + "where table_id = (select table_id from audit_version where audit_id = ?1) "
            + "and time < (select time from audit_version where audit_id = ?1) "
            + "order by time desc limit 1", nativeQuery = true)
    String getPreviousAuditIdFor(UUID id);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version "
            + "where table_id = cast(?1 as text) order by time desc limit 1", nativeQuery = true)
    AuditMetadata lastAuditForObject(UUID uuid);

    static Example<AuditVersion> exampleFrom(AuditVersion example) {
        return Example.of(example, matching().withIgnorePaths("id", "time"));
    }
}
