package no.nav.data.team.common.security.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;


public interface AuthRepository extends JpaRepository<Auth, UUID> {

}
