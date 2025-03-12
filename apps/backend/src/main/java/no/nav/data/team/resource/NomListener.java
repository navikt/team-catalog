package no.nav.data.team.resource;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.resource.dto.RessursState;
import no.nav.nom.graphql.model.RessursDto;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.springframework.kafka.listener.BatchAcknowledgingMessageListener;
import org.springframework.kafka.listener.ConsumerSeekAware;
import org.springframework.kafka.support.Acknowledgment;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class NomListener implements ConsumerSeekAware, BatchAcknowledgingMessageListener<String, String> {

    private final NomClient nomClient;
    private final NomGraphClient nomGraphClient;

    public NomListener(NomClient nomClient, NomGraphClient nomGraphClient) {
        this.nomClient = nomClient;
        this.nomGraphClient = nomGraphClient;
    }

    @Override
    public void onPartitionsAssigned(Map<TopicPartition, Long> assignments, ConsumerSeekCallback callback) {
        assignments.keySet().forEach(p -> callback.seekToBeginning(p.topic(), p.partition()));
    }

    @Override
    public void onMessage(List<ConsumerRecord<String, String>> data, Acknowledgment acknowledgment) {
        try {
            var resources = new ArrayList<NomRessurs>();

            for (ConsumerRecord<String, String> record : data) {
                var ressursState = JsonUtils.toObject(record.value(), RessursState.class);
                var nomRessurs = NomRessurs.fromRessursState(ressursState);
                resources.add(nomRessurs.addKafkaData(record.partition(), record.offset()));
            }
            {
                // temporary diagnostics logging
                var offsets = resources.stream().map(NomRessurs::getOffset).toList();
                var entriesPerNavident = new HashMap<String,Integer>(resources.size()/2);
                for(var r : resources){
                    var prev = entriesPerNavident.get(r.getNavident());
                    entriesPerNavident.put(r.getNavident(), prev == null ? 1 : prev + 1);
                }
                var counts = StreamUtils.distinctByKey(entriesPerNavident.values(),it -> it);

                var inOrder = true;
                for(var i = 1; i < offsets.size(); i += 1){
                    inOrder &= offsets.get(i-1) < offsets.get(i);
                }
                log.info("Kafka messages count: {}", data.size());
                log.info("Resources are ordered by offset? -> {}", inOrder );
                log.info("Distinct duplicate amounts in resources from kafka -> {}", counts);
            }

            var ressursMap = resources.stream().collect(Collectors.groupingBy(NomRessurs::getNavident));
            var eposter = nomGraphClient.getRessurser(new ArrayList<>(ressursMap.keySet())).values().stream()
                    .filter(ressurs -> ressurs.getEpost() != null)
                    .collect(Collectors.toMap(RessursDto::getNavident, RessursDto::getEpost));
            ressursMap.keySet().forEach(key -> ressursMap.get(key).forEach(ressurs -> ressurs.setEpost(eposter.get(key))));

            nomClient.add(resources);
        } catch (Exception e) {
            log.error("Failed to write nom ressurs", e);
            throw e;
        }
        acknowledgment.acknowledge();
    }

}
