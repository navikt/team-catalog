package no.nav.data.common.kafka;

import io.micrometer.core.instrument.MeterRegistry;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.data.team.resource.NomListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.MicrometerConsumerListener;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.ContainerProperties.AckMode;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;

import java.time.Duration;

@Configuration
public class KafkaConfig {

    @Value("${kafka.topics.nom-ressurs}")
    private String topic;

    @Bean
    public ConsumerFactory<String, String> nomRessursConsumer(KafkaProperties kafkaProperties, MeterRegistry meterRegistry) {
        var consumerFactory = new DefaultKafkaConsumerFactory<String, String>(kafkaProperties.buildConsumerProperties());
        consumerFactory.addListener(new MicrometerConsumerListener<>(meterRegistry));

        return consumerFactory;
    }

    @Bean
    public KafkaMessageListenerContainer<String, String> nomRessursContainer(
            ConsumerFactory<String, String> consumerFactory, NomClient nomClient, NomGraphClient nomGraphClient) {
        var containerProps = new ContainerProperties(topic);
        containerProps.setMessageListener(new NomListener(nomClient, nomGraphClient));
        containerProps.setAckMode(AckMode.MANUAL);
        containerProps.setPollTimeout(500);

        var container = new KafkaMessageListenerContainer<>(consumerFactory, containerProps);
        container.setCommonErrorHandler(new KafkaErrorHandler());
        container.getContainerProperties().setAuthExceptionRetryInterval(Duration.ofMinutes(5));

        return container;
    }
}
