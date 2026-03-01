package no.nav.data.team;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.test.context.EmbeddedKafka;

@Slf4j
@EmbeddedKafka(
        partitions = 1,
        topics = {"${kafka.topics.nom-ressurs}"}
)
public class KafkaTestBase {
}
