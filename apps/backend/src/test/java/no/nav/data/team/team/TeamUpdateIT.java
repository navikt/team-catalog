package no.nav.data.team.team;

import no.nav.data.team.KafkaTestBase;
import no.nav.data.team.avro.TeamUpdate;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import org.apache.kafka.clients.consumer.Consumer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class TeamUpdateIT extends KafkaTestBase {

    private Consumer<String, TeamUpdate> consumer;
    @Autowired
    private TeamService teamService;

    TeamRequest team = TeamRequest.builder()
            .name("team name")
            .description("descr")
            .members(List.of(
                    TeamMemberRequest.builder()
                            .nomId("person@nav.no")
                            .name("Navnet Vel")
                            .role("Lille rollen sin")
                            .build()
            ))
            .update(false)
            .build();

    @BeforeEach
    void setUp() {
        consumer = createConsumer(teamUpdateProducer.getTopic());
    }

    @AfterEach
    void tearDown() {
        consumer.close();
    }

    @Test
    void produceTeamUpdateMessage() {
        consumer.subscribe(List.of(teamUpdateProducer.getTopic()));
        var savedTeam = teamService.save(team);

        var record = KafkaTestUtils.getSingleRecord(consumer, teamUpdateProducer.getTopic());

        assertThat(record.key()).isEqualTo(savedTeam.getId().toString());
        assertThat(storageService.get(savedTeam.getId(), Team.class).isUpdateSent()).isTrue();
    }

    @Test
    void handleKafkaDown() throws InterruptedException {
        kafkaEnvironment.getBrokers().get(0).stop();

        var savedTeam = teamService.save(team);
        Thread.sleep(2000);
        assertThat(storageService.get(savedTeam.getId(), Team.class).isUpdateSent()).isFalse();

        kafkaEnvironment.getBrokers().get(0).start();
    }
}
