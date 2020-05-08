package no.nav.data.team.common.jpa;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.AppStarter;
import no.nav.data.team.common.auditing.AuditVersionListener;
import no.nav.data.team.common.auditing.AuditorAwareImpl;
import no.nav.data.team.common.auditing.domain.AuditVersionRepository;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.team.domain.Team;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.Collections;

import static no.nav.data.team.common.utils.MdcUtils.wrapAsync;
import static no.nav.data.team.team.domain.TeamRole.CASE_HANDLER;
import static no.nav.data.team.team.domain.TeamRole.DOMAIN_RESOURCE;

@Slf4j
@EntityScan(basePackageClasses = AppStarter.class)
@EnableJpaRepositories(basePackageClasses = AppStarter.class)
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return new AuditorAwareImpl();
    }

    @Bean
    @Order(10)
    public ApplicationRunner initAudit(AuditVersionRepository repository) {
        return args -> AuditVersionListener.setRepo(repository);
    }

    @Bean
    @Order(20)
    public ApplicationRunner migrate(StorageService storage) {
        return (args) -> wrapAsync(
                () -> {
                    var teams = storage.getAll(Team.class);
                    teams.forEach(t -> {
                        if (t.getMembers().stream().anyMatch(m -> Collections.replaceAll(m.getRoles(), CASE_HANDLER, DOMAIN_RESOURCE))) {
                            log.info("Migrating roles on team {}", t.getId());
                            storage.save(t);
                        }
                    });
                }, "Database migration")
                .run();
    }
}
