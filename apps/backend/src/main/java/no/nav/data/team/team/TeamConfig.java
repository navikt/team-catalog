package no.nav.data.team.team;

import no.nav.data.team.common.storage.StorageService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static no.nav.data.team.common.utils.MdcUtils.wrapAsync;

@Configuration
public class TeamConfig {

    @Bean
    public ApplicationRunner migrate(StorageService storage) {
        return (args) -> wrapAsync(
                () -> {
//                    var teams = storage.getAll(Team.class);
//                    teams.forEach(t -> {
//                        if (t.getMembers().stream().anyMatch(m -> Collections.replaceAll(m.getRoles(), CASE_HANDLER, DOMAIN_RESOURCE))) {
//                            storage.save(t);
//                        }
//                    });
                }, "Database migration")
                .run();
    }
}
