package no.nav.data.team.cluster;

import no.nav.data.common.storage.domain.GenericStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ClusterRepository extends JpaRepository<GenericStorage, UUID> {

    @Query(value = "select * from generic_storage where data ->> 'name' ilike %?1% and type = 'ProductArea'", nativeQuery = true)
    List<GenericStorage> findByNameLike(String name);

    @Query(value = "select * from generic_storage where data ->> 'name' ilike ?1 and type = 'ProductArea'", nativeQuery = true)
    List<GenericStorage> findByName(String name);

}
