package no.nav.data.team.team;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.avro.Member;
import no.nav.data.team.avro.TeamUpdate;
import no.nav.data.team.common.utils.MdcExecutor;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

import static no.nav.data.team.common.utils.StreamUtils.convert;

@Slf4j
@Component
public class TeamUpdateProducer {

    private final KafkaTemplate<String, TeamUpdate> template;
    private final TeamRepository teamRepository;
    private final NomClient nomClient;
    @Getter
    private final String topic;
    @Setter
    private boolean disable;

    public TeamUpdateProducer(KafkaTemplate<String, TeamUpdate> teamUpdateKafkaTemplate,
            TeamRepository teamRepository,
            NomClient nomClient,
            @Value("${kafka.topics.team-update}") String topic,
            Environment environment
    ) {
        this.template = teamUpdateKafkaTemplate;
        this.teamRepository = teamRepository;
        this.nomClient = nomClient;
        this.topic = topic;
        this.disable = Arrays.asList(environment.getActiveProfiles()).contains("test");
    }

    public void updateTeam(Team team) {
        if (disable) {
            log.info("Skipping kafka team update for team {}", team);
            return;
        }
        var time = LocalDateTime.now();

        TeamUpdate updateMessage = convertToKafka(team);
        log.info("Sending update for team {}", updateMessage.getId());
        try {
            template.send(topic, updateMessage.getId(), updateMessage)
                    .addCallback(MdcExecutor.wrap(res -> {
                        int rows = teamRepository.setUpdateSent(team.getId(), time);
                        log.info("Marked team={} updated={}", team.getId(), rows > 0);
                    }, e -> log.warn("Failed to send message " + updateMessage, e)));
        } catch (Exception e) {
            log.warn("Failed to send message " + updateMessage, e);
        }
    }

    public TeamUpdate convertToKafka(Team team) {
        return TeamUpdate.newBuilder()
                .setId(team.getId().toString())
                .setName(team.getName())
                .setDescription(team.getDescription())
                .setSlackChannel(team.getSlackChannel())
                .setNaisTeams(StreamUtils.copyOf(team.getNaisTeams()))
                .setProductAreaId(team.getProductAreaId())
                .setMembers(convert(team.getMembers(), this::convertToKafka))
                .build();
    }

    private Member convertToKafka(TeamMember member) {
        return Member.newBuilder()
                .setId(member.getNavIdent() == null ? "" : member.getNavIdent())
                .setName(nomClient.getNameForIdent(member.getNavIdent()))
                .setRole(member.getRole())
                .build();
    }
}
