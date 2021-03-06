package no.nav.data.team.resource.domain;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ResourcePhotoRepository extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'ident' = ?1 and type = 'ResourcePhoto'", nativeQuery = true)
    List<GenericStorage> findByIdent(String ident);

}
