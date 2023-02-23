package no.nav.data.common.auditing.domain;

import io.micrometer.core.annotation.Timed;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.MetricUtils.DB_QUERY_TIMED;
import static no.nav.data.common.utils.MetricUtils.QUERY;

public interface MailLogRepository extends JpaRepository<GenericStorage, UUID> {

    @Override
    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "MailLogRepository.findAll"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where type = 'MailLog' order by created_date desc",
            countQuery = "select count(1) from generic_storage where type = 'MailLog'"
            , nativeQuery = true)
    Page<GenericStorage> findAll(Pageable pageable);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "MailLogRepository.findAllNonUpdates"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where type = 'MailLog' and data->> 'subject' not like 'Teamkatalog oppdatering%' order by created_date desc",
            countQuery = "select count(1) from generic_storage where type = 'MailLog' and data->> 'subject' not like 'Teamkatalog oppdatering%'"
            , nativeQuery = true)
    Page<GenericStorage> findAllNonUpdates(Pageable pageable);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "MailLogRepository.findByTo"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where type = 'MailLog' and data ->> 'to' = ?1 order by created_date desc", nativeQuery = true)
    List<GenericStorage> findByTo(String to);
}
