package no.nav.data.common.security.domain;

import io.micrometer.core.annotation.Timed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.MetricUtils.DB_QUERY_TIMED;
import static no.nav.data.common.utils.MetricUtils.QUERY;


public interface AuthRepository extends JpaRepository<Auth, UUID> {

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuthRepository.findByLastActiveBefore"}, percentiles = {.99, .75, .50})
    List<Auth> findByLastActiveBefore(LocalDateTime time);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "AuthRepository.countDistinctUserIdByLastActiveAfter"}, percentiles = {.99, .75, .50})
    @Query(value = "select count(distinct user_id) "
            + "from auth "
            + "where last_active > ?1", nativeQuery = true)
    long countDistinctUserIdByLastActiveAfter(LocalDateTime time);
}
