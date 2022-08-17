package no.nav.data.team.resource;

import no.nav.data.common.utils.JsonUtils;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.KafkaTestBase;
import no.nav.data.team.resource.dto.NomRessurs;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

class NomListenerIT extends IntegrationTestBase {

    @Autowired
    private KafkaTemplate<String, String> stringTemplate;
    @Value("${kafka.topics.nom-ressurs}")
    private String topic;

    @Autowired
    private NomClient client;

    @Test
    void readResources() {
        int number = 200;
        List<String> ressurser = IntStream.range(0, number)
                .mapToObj(this::createRessurs)
                .map(JsonUtils::toJson)
                .collect(Collectors.toList());

        ressurser.forEach(json -> stringTemplate.send(topic, "1", json));
        NomRessurs ressurs = createRessurs(number);
        ressurs.setEtternavn("Last Name");
        stringTemplate.send(topic, "1", JsonUtils.toJson(ressurs));

        await().until(() -> client.getByNavIdent(createNavIdent(number)).isPresent());
        await().untilAsserted(() -> assertThat(client.search(ressurs.getEtternavn()).getPageSize()).isEqualTo(1));
    }

    private NomRessurs createRessurs(int i) {
        return NomRessurs.builder()
                .fornavn("Fornavn")
                .etternavn("Etternavn")
                .ressurstype("EKSTERN")
                .navident(createNavIdent(i))
                .build();
    }

}