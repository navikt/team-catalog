package no.nav.data.common.storage.domain;

import io.micrometer.core.annotation.Timed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.utils.MetricUtils.DB_QUERY_TIMED;
import static no.nav.data.common.utils.MetricUtils.QUERY;

public interface GenericStorageRepository extends JpaRepository<GenericStorage, UUID> {

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "GenericStorageRepository.existsByIdAndType"}, percentiles = {.99, .75, .50})
    boolean existsByIdAndType(UUID id, String type);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "GenericStorageRepository.findByType"}, percentiles = {.99, .75, .50})
    Optional<GenericStorage> findByType(String type);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "GenericStorageRepository.findAllByType"}, percentiles = {.99, .75, .50})
    List<GenericStorage> findAllByType(String type);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "GenericStorageRepository.countByType"}, percentiles = {.99, .75, .50})
    long countByType(String type);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "GenericStorageRepository.deleteByTypeAndCreatedDateBefore"}, percentiles = {.99, .75, .50})
    long deleteByTypeAndCreatedDateBefore(String type, LocalDateTime time);

    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "GenericStorageRepository.deleteByIdAndType"}, percentiles = {.99, .75, .50})
    void deleteByIdAndType(UUID id, String type);

    @Modifying
    @Timed(value = DB_QUERY_TIMED, extraTags = {QUERY, "GenericStorageRepository.deleteAll"}, percentiles = {.99, .75, .50})
    @Query("delete from GenericStorage where id in ?1")
    void deleteAll(List<UUID> uuids);
}
