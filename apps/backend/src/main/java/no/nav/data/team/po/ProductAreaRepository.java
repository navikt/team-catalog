package no.nav.data.team.po;

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

public interface ProductAreaRepository extends JpaRepository<GenericStorage, UUID> {

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "ProductAreaRepository.findByNameLike"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where data ->> 'name' ilike %?1% and type = 'ProductArea'", nativeQuery = true)
    List<GenericStorage> findByNameLike(String name);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "ProductAreaRepository.findByName"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where data ->> 'name' ilike ?1 and type = 'ProductArea'", nativeQuery = true)
    List<GenericStorage> findByName(String name);
}
