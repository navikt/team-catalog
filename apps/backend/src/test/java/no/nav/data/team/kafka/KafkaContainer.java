package no.nav.data.team.kafka;

import org.testcontainers.containers.Network;
import org.testcontainers.utility.DockerImageName;

public class KafkaContainer extends org.testcontainers.kafka.KafkaContainer {
    public KafkaContainer(DockerImageName image) {
        super(image);
        withNetwork(Network.SHARED);
    }

    public String getAddress() {
        return getBootstrapServers();
    }
}
