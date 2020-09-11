package no.nav.data.common.auditing.domain;

import no.nav.data.common.auditing.dto.AuditSummary;
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

    @Query(value = "select time, action, table_name, table_id "
            + "from audit_version "
            + "where time > ?1 "
            + "and time < now() at time zone 'Europe/Oslo' - interval '5 minute' "
            + "and (table_name = 'Team' or table_name = 'ProductArea')", nativeQuery = true)
    List<AuditSummary> summaryFor(LocalDateTime start);

    static Example<AuditVersion> exampleFrom(AuditVersion example) {
        return Example.of(example, matching().withIgnorePaths("id", "time"));
    }
}
