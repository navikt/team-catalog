package no.nav.data.team.sync;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.team.TeamRepository;
import no.nav.data.team.team.TeamUpdateProducer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(value = "team-catalog.envlevel", havingValue = "primary")
public class SyncService {

    private final TeamUpdateProducer teamUpdateProducer;
    private final TeamRepository teamRepository;

    @SchedulerLock(name = "catchupUpdates")
    @Scheduled(cron = "0 15 * * * ?")
    public void catchupUpdates() {
        var uptime = DateUtil.uptime();
        if (uptime.minus(Duration.ofMinutes(10)).isNegative()) {
            log.info("Skipping catchupUpdates, uptime {}", uptime.toString());
            return;
        }
        teamUpdates();
    }

    public int resetSyncStatus() {
        return teamRepository.resetSyncFlags();
    }

    public void teamUpdates() {
        List<GenericStorage> unsentUpdates = teamRepository.findUnsentUpdates();
        unsentUpdates.forEach(teamStorage -> {
            var team = teamStorage.toTeam();
            log.info("Sending team={}", team.getId());
            teamUpdateProducer.updateTeam(team);
            teamRepository.setUpdateSent(team.getId());
        });
    }
}
