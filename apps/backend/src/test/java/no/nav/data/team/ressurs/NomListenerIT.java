package no.nav.data.team.ressurs;

import no.nav.data.team.KafkaTestBase;
import no.nav.data.team.common.utils.JsonUtils;
import no.nav.data.team.ressurs.dto.NomRessurs;
import org.awaitility.Awaitility;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class NomListenerIT extends KafkaTestBase {

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

        Awaitility.await().until(() -> client.getByNavIdent(getNavident(number)) != null);
        assertThat(client.search(ressurs.getEtternavn())).hasSize(1);
    }

    private NomRessurs createRessurs(int i) {
        return NomRessurs.builder()
                .fornavn("Fornavn")
                .etternavn("Etternavn")
                .ressurstype("EKSTERN")
                .navident(getNavident(i))
                .build();
    }

    @NotNull
    private String getNavident(int i) {
        return "A" + (123456 + i);
    }
}