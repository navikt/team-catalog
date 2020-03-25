package no.nav.data.team.team;

import no.nav.common.KafkaEnvironment.BrokerStatus;
import no.nav.data.team.KafkaTestBase;
import no.nav.data.team.avro.TeamUpdate;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import org.apache.kafka.clients.consumer.Consumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static no.nav.data.team.TestDataHelper.createResource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

public class TeamUpdateIT extends KafkaTestBase {

    private static Consumer<String, TeamUpdate> consumer = createConsumer("aapen-team-update-v1");
    @Autowired
    private TeamService teamService;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    TeamRequest team = TeamRequest.builder()
            .name("team name")
            .description("descr")
            .members(List.of(
                    TeamMemberRequest.builder()
                            .navIdent(createNavIdent(0))
                            .role("Lille rollen sin")
                            .build()
            ))
            .update(false)
            .build();

    @BeforeEach
    void setUp() {
        addNomResource(createResource("Fam", "Giv", createNavIdent(0)));
    }

    @Test
    void produceTeamUpdateMessage() {
        var savedTeam = teamService.save(team);

        var record = KafkaTestUtils.getSingleRecord(consumer, teamUpdateProducer.getTopic());

        assertThat(record.key()).isEqualTo(savedTeam.getId().toString());
        TeamUpdate update = record.value();
        assertThat(update.getId()).isEqualTo(savedTeam.getId().toString());
        assertThat(update.getName()).isEqualTo("team name");
        assertThat(update.getMembers().get(0).getId()).isEqualTo(createNavIdent(0));
        assertThat(update.getMembers().get(0).getName()).isEqualTo("Giv Fam");
        assertThat(update.getMembers().get(0).getRole()).isEqualTo("Lille rollen sin");
        assertThat(storageService.get(savedTeam.getId(), Team.class).isUpdateSent()).isTrue();
    }

    @Test
    void handleKafkaDown() {
        kafkaEnvironment.getBrokers().get(0).stop();
        team.setName("down test");
        var savedTeam = teamService.save(team);
        awaitProducerTimeout();
        UUID id = savedTeam.getId();
        assertThat(storageService.get(id, Team.class).isUpdateSent()).isFalse();

        kafkaEnvironment.getBrokers().get(0).start();
        await().atMost(Duration.ofSeconds(10)).until(() ->
                kafkaEnvironment.getServerPark().getBrokerStatus() instanceof BrokerStatus.Available);

        jdbcTemplate.update("update generic_storage set last_modified_date = ? where id = ?", LocalDateTime.now().minusMinutes(35), id);
        teamService.executeCatchupUpdates();
        await().atMost(Duration.ofSeconds(2)).until(() ->
                storageService.get(id, Team.class).isUpdateSent());

        var record = KafkaTestUtils.getSingleRecord(consumer, teamUpdateProducer.getTopic());
        assertThat(record.key()).isEqualTo(savedTeam.getId().toString());
    }
}
