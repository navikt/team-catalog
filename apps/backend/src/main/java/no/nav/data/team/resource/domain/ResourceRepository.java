package no.nav.data.team.resource.domain;

import io.micrometer.core.annotation.Timed;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.utils.MetricUtils.DB_QUERY_TIMED;
import static no.nav.data.common.utils.MetricUtils.QUERY;

public interface ResourceRepository extends JpaRepository<GenericStorage, UUID>, ResourceRepositoryCustom {

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "ResourceRepository.findByIdent"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage "
            + "where type = 'Resource' and data ->> 'navIdent' = ?1 "
            + "order by created_date desc limit 1", nativeQuery = true)
    Optional<GenericStorage> findByIdent(String navIdent);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "ResourceRepository.findByIdents"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where type = 'Resource' and data ->> 'navIdent' in (?1)", nativeQuery = true)
    List<GenericStorage> findByIdents(List<String> navIdents);

    @Override
    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "ResourceRepository.count"}, percentiles = {.99, .75, .50})
    @Query(value = "select count(distinct data->> 'navIdent') from generic_storage where type = 'Resource'", nativeQuery = true)
    long count();

    @Transactional
    @Modifying
    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "ResourceRepository.cleanup"}, percentiles = {.99, .75, .50})
    @Query(value = """
             delete
             from generic_storage gs
                using generic_storage gs2
             where gs.type = 'Resource'
              and gs2.type = 'Resource'
              and gs.id <> gs2.id
              and gs.data ->> 'navIdent' = gs2.data ->> 'navIdent'
              and (
                    gs.data -> 'offset' < gs2.data -> 'offset' 
                    or (gs.data -> 'offset' = gs2.data -> 'offset' and gs.created_date < gs2.created_date)
                  )
            """, nativeQuery = true)
    void cleanup();

}
