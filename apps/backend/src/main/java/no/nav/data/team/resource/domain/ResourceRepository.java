package no.nav.data.team.resource.domain;

import no.nav.data.team.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage "
            + "where type = 'Resource' and data ->> 'navIdent' = ?1 "
            + "order by created_date desc limit 1", nativeQuery = true)
    Optional<GenericStorage> findByIdent(String navIdent);

    @Query(value = "select * from generic_storage where type = 'Resource' and data ->> 'navIdent' in (?1)", nativeQuery = true)
    List<GenericStorage> findByIdents(List<String> navIdents);

    @Override
    @Query(value = "select count(distinct data->> 'navIdent') from generic_storage where type = 'Resource'", nativeQuery = true)
    long count();

    @Transactional
    @Modifying
    @Query(value = "delete from generic_storage gs where type = 'Resource' "
            + "and exists ("
            + " select 1 from generic_storage gs2 "
            + "where gs.id <> gs2.id "
            + "and gs.data ->> 'navIdent' = gs2.data ->> 'navIdent' "
            + "and gs.data -> 'readTimeEpoch' < gs2.data ->'readTimeEpoch' "
            + ")", nativeQuery = true)
    void cleanup();
}
