package no.nav.data.team;

import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.utils.KafkaTestUtils;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.fail;
import static org.awaitility.Awaitility.await;

@Slf4j
public class KafkaTestBase extends IntegrationTestBase {

    @Autowired
    protected TeamUpdateProducer teamUpdateProducer;
    @Autowired
    protected KafkaTemplate<String, String> stringTemplate;

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

    protected static  <T> Consumer<String, T> createConsumer(String topic) {
        String groupId = "teamcat-itest-" + topic;
        Map<String, Object> configs = new HashMap<>(KafkaTestUtils.consumerProps(kafkaEnvironment.getBrokersURL(), groupId, "false"));
        configs.put("specific.avro.reader", "true");
        configs.put("schema.registry.url", kafkaEnvironment.getSchemaRegistry().getUrl());
        configs.put(ConsumerConfig.CLIENT_ID_CONFIG, "teamcatbacktest");
        configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, KafkaAvroDeserializer.class);
        configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        Consumer<String, T> consumer = new DefaultKafkaConsumerFactory<>(configs, (Deserializer<String>) null, (Deserializer<T>) null).createConsumer();
        consumer.subscribe(List.of(topic));
        return consumer;
    }

    protected void awaitProducerTimeout() {
        long start = System.currentTimeMillis();
        await()
                .pollDelay(Duration.ofSeconds(1))
                .atMost(Duration.ofSeconds(10)).until(() -> {
            try {
                stringTemplate.send("sometopic", "somedata").get();
                fail("Should time out and throw");
            } catch (Exception e) {
                log.info("producer timed out");
            }
            return true;
        });
        log.info("waited for producer to time out for {} millis", System.currentTimeMillis() - start);
    }
}
