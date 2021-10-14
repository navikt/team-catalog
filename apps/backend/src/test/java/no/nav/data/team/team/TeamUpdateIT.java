package no.nav.data.team.team;

import no.nav.data.team.KafkaTestBase;
import no.nav.data.team.avro.TeamUpdate;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.sync.SyncService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import org.apache.kafka.clients.consumer.Consumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static no.nav.data.team.TestDataHelper.createResource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

public class TeamUpdateIT extends KafkaTestBase {

    private static final Consumer<String, TeamUpdate> consumer = createConsumer("aapen-team-update-v1");
    @Autowired
    private TeamService teamService;
    @Autowired
    private SyncService syncService;

    TeamRequest team = TeamRequest.builder()
            .name("team name")
            .description("descr")
            .members(List.of(
                    TeamMemberRequest.builder()
                            .navIdent(createNavIdent(0))
                            .roles(List.of(TeamRole.DEVELOPER))
                            .description("Lille rollen sin")
                            .build()
            ))
            .update(false)
            .build();

    @BeforeEach
    void setUp() {
        var pa = storageService.save(ProductArea.builder().name("pa1").build());
        addNomResource(createResource("Fam", "Giv", createNavIdent(0)));
        when(teamCatalogProps.getDefaultProductareaUuid()).thenReturn(pa.getId().toString());
    }

    @Test
    void produceTeamUpdateMessage() {
        var savedTeam = teamService.save(team);
        jdbcTemplate.update("update generic_storage set last_modified_date = ? where id = ?",
                LocalDateTime.now().minusMinutes(10), savedTeam.getId());
        syncService.teamUpdates();

        var record = KafkaTestUtils.getSingleRecord(consumer, teamUpdateProducer.getTopic());

        assertThat(record.key()).isEqualTo(savedTeam.getId().toString());
        TeamUpdate update = record.value();
        assertThat(update.getId()).isEqualTo(savedTeam.getId().toString());
        assertThat(update.getName()).isEqualTo("team name");
        assertThat(update.getMembers().get(0).getId()).isEqualTo(createNavIdent(0));
        assertThat(update.getMembers().get(0).getName()).isEqualTo("Giv Fam");
        assertThat(update.getMembers().get(0).getRole()).isEqualTo("DEVELOPER");
        assertThat(storageService.get(savedTeam.getId(), Team.class).isUpdateSent()).isTrue();
    }
}
