package no.nav.data.team.notify.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends CrudRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'ident' = ?1 and type = 'Notification'", nativeQuery = true)
    List<GenericStorage> findByIdent(String ident);

    @Query(value = "select * from generic_storage where data ->> 'time' = :#{#time.name()} and type = 'Notification'", nativeQuery = true)
    List<GenericStorage> findByTime(@Param("time") NotificationTime time);

    @Transactional
    @Modifying
    @Query(value = "update generic_storage set data = jsonb_set(data, '{lastNudge}', to_jsonb(?2)) where id = ?1", nativeQuery = true)
    void updateNudge(UUID id, String time);
}
