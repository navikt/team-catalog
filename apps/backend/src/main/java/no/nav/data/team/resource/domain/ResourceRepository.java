package no.nav.data.team.resource.domain;

import no.nav.data.team.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where type = 'Resource' and data ->> 'navIdent' = ?1", nativeQuery = true)
    Optional<GenericStorage> findByIdent(String navIdent);

    @Query(value = "select * from generic_storage where type = 'Resource' and data ->> 'navIdent' in (?1)", nativeQuery = true)
    List<GenericStorage> findByIdents(List<String> navIdents);
}
