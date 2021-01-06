package no.nav.data.team;

import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.kafka.KafkaContainer;
import no.nav.data.team.kafka.SchemaRegistryContainer;
import no.nav.data.team.team.TeamUpdateProducer;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class KafkaTestBase extends IntegrationTestBase {

    private static final String CONFLUENT_VERSION = "6.0.1";

    private static final KafkaContainer kafkaContainer = new KafkaContainer(CONFLUENT_VERSION);
    private static final SchemaRegistryContainer schemaRegistryContainer = new SchemaRegistryContainer(CONFLUENT_VERSION, kafkaContainer);

    static {
        // The limited junit5 support for testcontainers do not support containers to live across separate ITests
        kafkaContainer.start();
        schemaRegistryContainer.start();
    }

    @Autowired
    protected TeamUpdateProducer teamUpdateProducer;
    @Autowired
    protected KafkaTemplate<String, String> stringTemplate;

    @BeforeEach
    void setUpKafka() {
        teamUpdateProducer.setDisable(false);
    }

    @AfterEach
    void tearDownKafka() {
        teamUpdateProducer.setDisable(true);
    }

    protected static <T> Consumer<String, T> createConsumer(String topic) {
        String groupId = "teamcat-itest-" + topic;
        Map<String, Object> configs = new HashMap<>(KafkaTestUtils.consumerProps(KafkaContainer.getAddress(), groupId, "false"));
        configs.put("specific.avro.reader", "true");
        configs.put("schema.registry.url", SchemaRegistryContainer.getAddress());
        configs.put(ConsumerConfig.CLIENT_ID_CONFIG, "teamcatbacktest");
        configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, KafkaAvroDeserializer.class);
        configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        Consumer<String, T> consumer = new DefaultKafkaConsumerFactory<>(configs, (Deserializer<String>) null, (Deserializer<T>) null).createConsumer();
        consumer.subscribe(List.of(topic));
        return consumer;
    }

}
