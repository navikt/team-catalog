package no.nav.data.common.kafka;

import io.confluent.kafka.serializers.KafkaAvroSerializer;
import io.micrometer.core.instrument.MeterRegistry;
import no.nav.data.team.avro.TeamUpdate;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.NomListener;
import org.apache.commons.lang3.SystemUtils;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.config.SslConfigs;
import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.Serializer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.MicrometerConsumerListener;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.ContainerProperties.AckMode;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    private final String schemaReg;
    private final String bootstrapServers;
    private final String user;
    private final String pwd;
    private final String securityProtocol;
    private final String trustStore;
    private final String trustStorePassword;

    public KafkaConfig(
            @Value("${kafka.schema-registry}") String schemaReg,
            @Value("${kafka.bootstrap-servers}") String bootstrapServers,
            @Value("${kafka.user}") String user,
            @Value("${kafka.pwd}") String pwd,
            @Value("${kafka.security.protocol}") String securityProtocol,
            @Value("${kafka.ssl.truststore.location}") String trustStore,
            @Value("${kafka.ssl.truststore.password}") String trustStorePassword
    ) {
        this.schemaReg = schemaReg;
        this.bootstrapServers = bootstrapServers;
        this.user = user;
        this.pwd = pwd;
        this.securityProtocol = securityProtocol;
        this.trustStore = trustStore;
        this.trustStorePassword = trustStorePassword;
    }

    @Bean
    public KafkaTemplate<String, String> stringTemplate() {
        Map<String, Object> senderProps = producerProps(StringSerializer.class, "string-producer");
        ProducerFactory<String, String> pf = new DefaultKafkaProducerFactory<>(senderProps);
        return new KafkaTemplate<>(pf);
    }

    @Bean
    public KafkaTemplate<String, TeamUpdate> teamUpdateKafkaTemplate() {
        Map<String, Object> senderProps = producerProps(KafkaAvroSerializer.class, "avro-producer");
        ProducerFactory<String, TeamUpdate> pf = new DefaultKafkaProducerFactory<>(senderProps);
        return new KafkaTemplate<>(pf);
    }

    @Bean
    public KafkaMessageListenerContainer<String, String> nomRessursContainer(
            @Value("${kafka.topics.nom-ressurs}") String topic,
            NomClient nomClient, MeterRegistry meterRegistry
    ) {
        var containerProps = new ContainerProperties(topic);
        containerProps.setMessageListener(new NomListener(nomClient));
        containerProps.setAckMode(AckMode.MANUAL);
        containerProps.setPollTimeout(500);
        var props = consumerProps(StringDeserializer.class, "nom-cons");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "100");

        var cf = new DefaultKafkaConsumerFactory<String, String>(props);
        cf.addListener(new MicrometerConsumerListener<>(meterRegistry));
        var container = new KafkaMessageListenerContainer<>(cf, containerProps);
        container.setBatchErrorHandler(new KafkaErrorHandler());
        container.getContainerProperties().setAuthorizationExceptionRetryInterval(Duration.ofMinutes(5));
        return container;
    }

    private Map<String, Object> consumerProps(Class<? extends Deserializer<?>> valueDeserializer, String id) {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "teamcat-" + SystemUtils.getHostName());
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, valueDeserializer);
        props.put("specific.avro.reader", "true");
        props.putAll(commonKafkaProps(id));
        return props;
    }

    private Map<String, Object> producerProps(Class<? extends Serializer<?>> valueSerializer, String id) {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, "500");
        props.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, "400");
        props.put(ProducerConfig.LINGER_MS_CONFIG, "10");
        props.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, "600");
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, "1");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, valueSerializer);
        props.putAll(commonKafkaProps(id));
        return props;
    }

    public Map<String, Object> commonKafkaProps(String id) {
        Map<String, Object> props = new HashMap<>();
        props.put(CommonClientConfigs.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, securityProtocol);
        props.put(SaslConfigs.SASL_MECHANISM, "PLAIN");
        props.put(SaslConfigs.SASL_JAAS_CONFIG, String.format("org.apache.kafka.common.security.plain.PlainLoginModule required username=\"%s\" password=\"%s\";", user, pwd));
        props.put(SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, trustStore);
        props.put(SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, trustStorePassword);
        props.put(CommonClientConfigs.CLIENT_ID_CONFIG, "team-catalog-backend-" + id);
        props.put("schema.registry.url", schemaReg);
        return props;
    }

}
