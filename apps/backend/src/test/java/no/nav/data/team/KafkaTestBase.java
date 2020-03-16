package no.nav.data.team;

import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import no.nav.data.team.team.TeamUpdateProducer;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.util.HashMap;
import java.util.Map;

public class KafkaTestBase extends IntegrationTestBase {

    @Autowired
    protected TeamUpdateProducer teamUpdateProducer;

    @BeforeAll
    static void beforeAll() {
        kafkaEnvironment.start();
    }

    @BeforeEach
    void setUpKafka() {
        teamUpdateProducer.setDisable(false);
    }

    @AfterEach
    void tearDownKafka() {
        teamUpdateProducer.setDisable(true);
    }

    protected <T> Consumer<String, T> createConsumer(String topic) {
        Map<String, Object> configs = new HashMap<>(KafkaTestUtils.consumerProps(kafkaEnvironment.getBrokersURL(), "teamcata-itest", "false"));
        configs.put("specific.avro.reader", "true");
        configs.put("schema.registry.url", kafkaEnvironment.getSchemaRegistry().getUrl());
        configs.put(ConsumerConfig.CLIENT_ID_CONFIG, "teamcatbacktest");
        configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, KafkaAvroDeserializer.class.getName());
        configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return new DefaultKafkaConsumerFactory<>(configs, (Deserializer<String>) null, (Deserializer<T>) null).createConsumer();
    }
}
