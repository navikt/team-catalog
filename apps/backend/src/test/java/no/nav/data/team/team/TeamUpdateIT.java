package no.nav.data.team.team;

import no.nav.data.team.KafkaTestBase;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import org.apache.kafka.clients.consumer.Consumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class TeamUpdateIT extends KafkaTestBase {

    private Consumer<String, no.nav.data.team.avro.TeamUpdate> consumer;

    @BeforeEach
    void setUp() {
        consumer = createConsumer(teamUpdateProducer.getTopic());
    }

    @Test
    void produceTeamUpdateMessage() {
        Team team = Team.builder()
                .id(UUID.randomUUID())
                .name("team name")
                .description("descr")
                .members(List.of(
                        TeamMember.builder()
                                .nomId("person@nav.no")
                                .name("Navnet Vel")
                                .role("Lille rollen sin")
                                .build()
                ))
                .build();
        teamUpdateProducer.updateTeam(team);

        var record = KafkaTestUtils.getSingleRecord(consumer, teamUpdateProducer.getTopic());

        assertThat(record.key()).isEqualTo(team.getId().toString());
    }
}
