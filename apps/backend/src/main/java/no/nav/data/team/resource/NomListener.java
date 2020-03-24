package no.nav.data.team.resource;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.utils.JsonUtils;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.dto.NomRessurs;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.springframework.kafka.listener.BatchAcknowledgingMessageListener;
import org.springframework.kafka.listener.ConsumerSeekAware;
import org.springframework.kafka.support.Acknowledgment;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
public class NomListener implements ConsumerSeekAware, BatchAcknowledgingMessageListener<String, String> {

    private final NomClient nomClient;

    public NomListener(NomClient nomClient) {
        this.nomClient = nomClient;
    }

    @Override
    public void onPartitionsAssigned(Map<TopicPartition, Long> assignments, ConsumerSeekCallback callback) {
        assignments.keySet().forEach(p -> callback.seekToBeginning(p.topic(), p.partition()));
    }

    @Override
    public void onMessage(List<ConsumerRecord<String, String>> data, Acknowledgment acknowledgment) {
        try {
            var resources = new ArrayList<Resource>();
            for (ConsumerRecord<String, String> record : data) {
                NomRessurs nomRessurs = JsonUtils.toObject(record.value(), NomRessurs.class);
                if (nomRessurs.getNavident() == null) {
                    log.warn("ressurs missing ident {}", nomRessurs);
                } else {
                    resources.add(nomRessurs.convertToDomain());
                }
            }
            nomClient.add(resources);
        } catch (Exception e) {
            log.error("Failed to write nom ressurs", e);
        }
        acknowledgment.acknowledge();
    }

}
