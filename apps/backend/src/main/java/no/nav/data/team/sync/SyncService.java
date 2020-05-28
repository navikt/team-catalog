package no.nav.data.team.sync;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.graph.GraphService;
import no.nav.data.team.po.ProductAreaRepository;
import no.nav.data.team.team.TeamRepository;
import no.nav.data.team.team.TeamUpdateProducer;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class SyncService {

    private final TeamUpdateProducer teamUpdateProducer;
    private final GraphService graphService;

    private final TeamRepository teamRepository;
    private final ProductAreaRepository productAreaRepository;

    public SyncService(TeamUpdateProducer teamUpdateProducer, GraphService graphService,
            TeamRepository teamRepository, ProductAreaRepository productAreaRepository
    ) {
        this.teamUpdateProducer = teamUpdateProducer;
        this.teamRepository = teamRepository;
        this.productAreaRepository = productAreaRepository;
        this.graphService = graphService;
    }

    /**
     * Desync nodes with random minute and second
     */
    @Scheduled(cron = "${random.int[0,59]} ${random.int[0,59]} * * * ?")
    public void catchupUpdates() {
        var uptime = Duration.ofMillis(ManagementFactory.getRuntimeMXBean().getUptime());
        if (uptime.minus(Duration.ofMinutes(10)).isNegative()) {
            log.info("Skipping catchupUpdates, uptime {}", uptime.toString());
            return;
        }
        // ProductArea must be created in graph first
        productAreaUpdates();
        teamUpdates();
    }

    public void teamUpdates() {
        List<GenericStorage> unsentUpdates = teamRepository.findUnsentUpdates();
        unsentUpdates.forEach(teamStorage -> {
            var team = teamStorage.toTeam();
            log.info("Sending team={}", team.getId());
            teamUpdateProducer.updateTeam(team);
            graphService.addTeam(team);
            teamRepository.setUpdateSent(team.getId(), LocalDateTime.now());
        });
    }

    public void productAreaUpdates() {
        List<GenericStorage> unsentUpdates = productAreaRepository.findUnsentUpdates();
        unsentUpdates.forEach(teamStorage -> {
            var productArea = teamStorage.toProductArea();
            log.info("Sending productArea={}", productArea.getId());
            graphService.addProductArea(productArea);
            productAreaRepository.setUpdateSent(productArea.getId(), LocalDateTime.now());
        });
    }
}
