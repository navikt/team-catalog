package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.team.domain.Team;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

import static no.nav.data.team.common.utils.MdcUtils.wrapAsync;
import static no.nav.data.team.team.domain.TeamRole.CASE_HANDLER;
import static no.nav.data.team.team.domain.TeamRole.DOMAIN_RESOURCE;

@Slf4j
@Configuration
public class TeamConfig {

    @Bean
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
