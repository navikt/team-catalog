package no.nav.data.team.resource.domain;

import io.micrometer.core.annotation.Timed;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.MetricUtils.DB_QUERY_TIMED;
import static no.nav.data.common.utils.MetricUtils.QUERY;

public interface ResourcePhotoRepository extends JpaRepository<GenericStorage, UUID> {

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "ResourcePhotoRepository.findByIdent"}, percentiles = {.99, .75, .50})
    @Query(value = "select * from generic_storage where data ->> 'ident' = ?1 and type = 'ResourcePhoto'", nativeQuery = true)
    List<GenericStorage> findByIdent(String ident);

}
