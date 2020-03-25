package no.nav.data.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.common.KafkaEnvironment;
import no.nav.data.team.IntegrationTestBase.Initializer;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.storage.domain.GenericStorageRepository;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Arrays;
import java.util.List;
import java.util.Properties;

@Slf4j
@ActiveProfiles("test")
@ExtendWith(WiremockExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, classes = {AppStarter.class})
@ContextConfiguration(initializers = {Initializer.class})
public abstract class IntegrationTestBase {

    private static PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:11.3");

    static {
        postgreSQLContainer.start();
        System.setProperty("zookeeper.jmx.log4j.disable", "true");
    }

    @Autowired
    protected TestRestTemplate restTemplate;
    @Autowired
    protected GenericStorageRepository repository;
    @Autowired
    protected StorageService storageService;
    @Autowired
    protected NomClient nomClient;
    protected static KafkaEnvironment kafkaEnvironment = new KafkaEnvironment(1, List.of(), List.of(), true, false, List.of(), false, new Properties());

    @BeforeEach
    void setUpBase() {
        repository.deleteAll();
    }

    @AfterEach
    void tearDownBase() {
        repository.deleteAll();
    }

    protected void addNomResource(Resource... resources) {
        nomClient.add(Arrays.asList(resources));
    }

    public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=" + postgreSQLContainer.getJdbcUrl(),
                    "spring.datasource.username=" + postgreSQLContainer.getUsername(),
                    "spring.datasource.password=" + postgreSQLContainer.getPassword(),
                    "wiremock.server.port=" + WiremockExtension.getWiremock().port(),
                    "KAFKA_BOOTSTRAP_SERVERS=" + kafkaEnvironment.getBrokersURL(),
                    "KAFKA_SCHEMA_REGISTRY_URL=" + kafkaEnvironment.getSchemaRegistry().getUrl()
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }
}
