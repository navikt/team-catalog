package no.nav.data.team.kafka;

import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.wait.strategy.HttpWaitStrategy;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

public class SchemaRegistryContainer extends GenericContainer<SchemaRegistryContainer> {
    private static final int SCHEMA_REGISTRY_PORT = 8081;

    public SchemaRegistryContainer(DockerImageName image, KafkaContainer kafkaContainer) {
        super(image);
        withNetwork(kafkaContainer.getNetwork());
        withExposedPorts(SCHEMA_REGISTRY_PORT);
        dependsOn(kafkaContainer);
        withEnv("SCHEMA_REGISTRY_HOST_NAME", "schema-registry");
        withEnv("SCHEMA_REGISTRY_LISTENERS", "http://0.0.0.0:8081");
        withEnv("SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS", "PLAINTEXT://" + kafkaContainer.getNetworkAliases().get(0) + ":9092");
        waitingFor(new HttpWaitStrategy().forPort(SCHEMA_REGISTRY_PORT).withStartupTimeout(Duration.ofMinutes(2)));
    }

    public String getAddress() {
        return "http://localhost:" + getMappedPort(SCHEMA_REGISTRY_PORT);
    }

}