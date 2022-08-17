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
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.condition.DisabledOnOs;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.Network;
import org.testcontainers.containers.wait.strategy.HttpWaitStrategy;
import org.testcontainers.utility.DockerImageName;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.condition.OS.MAC;

@Slf4j
public class KafkaTestBase {
    static final String CURRENT_ARCHITECTURE = System.getProperty("os.arch");
    static final String CURRENT_OS = System.getProperty("os.name");
    static String KAFKA_BOOTSTRAP_SERVERS;
    static String KAFKA_SCHEMA_REGISTRY_URL;

    private static final String CONFLUENT_VERSION = "7.2.1";
    private static final String KAFKA_IMAGE = "confluentinc/cp-kafka:" + CONFLUENT_VERSION;
    private static final String SCHEMA_REGISTRY_IMAGE = "confluentinc/cp-schema-registry:" + CONFLUENT_VERSION;

    private static KafkaContainer kafkaContainer;

     static {
        DockerImageName kafkaImageName;
        DockerImageName schemaRegImageName;

        if (CURRENT_OS.toLowerCase().contains("mac") && (CURRENT_ARCHITECTURE.toLowerCase().equals("x86_64")) || CURRENT_ARCHITECTURE.toLowerCase().equals("aarch64")) {
            log.debug("Setting up arm64 containers");
            kafkaImageName = DockerImageName.parse(KAFKA_IMAGE + ".arm64");
            schemaRegImageName = DockerImageName.parse(SCHEMA_REGISTRY_IMAGE + ".arm64");
        } else {
            log.debug("Setting up standard containers");
            kafkaImageName = DockerImageName.parse(KAFKA_IMAGE);
            schemaRegImageName = DockerImageName.parse(SCHEMA_REGISTRY_IMAGE);
        }

        kafkaContainer = new KafkaContainer(kafkaImageName);
        SchemaRegistryContainer schemaRegistryContainer = new SchemaRegistryContainer(schemaRegImageName, kafkaContainer);

        kafkaContainer.start();
        schemaRegistryContainer.start();

        KAFKA_BOOTSTRAP_SERVERS =  kafkaContainer.getAddress();
        KAFKA_SCHEMA_REGISTRY_URL = schemaRegistryContainer.getAddress();
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
        Map<String, Object> configs = new HashMap<>(KafkaTestUtils.consumerProps(kafkaContainer.getBootstrapServers(), groupId, "false"));
        configs.put("specific.avro.reader", "true");
        configs.put("schema.registry.url", KAFKA_SCHEMA_REGISTRY_URL);
        configs.put(ConsumerConfig.CLIENT_ID_CONFIG, "teamcatbacktest");
        configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, KafkaAvroDeserializer.class);
        configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        Consumer<String, T> consumer = new DefaultKafkaConsumerFactory<>(configs, (Deserializer<String>) null, (Deserializer<T>) null).createConsumer();
        consumer.subscribe(List.of(topic));
        return consumer;
    }

}
