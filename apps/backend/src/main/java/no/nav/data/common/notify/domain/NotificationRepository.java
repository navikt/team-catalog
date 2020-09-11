package no.nav.data.common.notify.domain;

import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends CrudRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'ident' = ?1 and type = 'Notification'", nativeQuery = true)
    List<GenericStorage> findByIdent(String ident);

    @Query(value = "select * from generic_storage where data ->> 'time' = :#{#time.name()} and type = 'Notification'", nativeQuery = true)
    List<GenericStorage> findByTime(@Param("type") NotificationTime time);
}
