package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.nullToEmptyList;
import static no.nav.data.team.common.utils.StringUtils.isUUID;

@Slf4j
@Service
public class TeamService {

    private final StorageService storage;
    private final NaisTeamService naisTeamService;
    private final TeamUpdateProducer teamUpdateProducer;
    private final TeamRepository teamRepository;

    public TeamService(StorageService storage, NaisTeamService naisTeamService, TeamUpdateProducer teamUpdateProducer, TeamRepository teamRepository) {
        this.storage = storage;
        this.naisTeamService = naisTeamService;
        this.teamUpdateProducer = teamUpdateProducer;
        this.teamRepository = teamRepository;
    }

    public Team save(TeamRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateProductArea)
                .addValidations(validator -> nullToEmptyList(request.getMembers()).forEach(member -> validateMembers(validator, member)))
                .addValidations(validator -> nullToEmptyList(request.getNaisTeams()).forEach(naisTeam -> validateNaisTeam(validator, naisTeam)))
                .ifErrorsThrowValidationException();

        var team = request.isUpdate() ? storage.get(request.getIdAsUUID(), Team.class) : new Team();

        storage.save(team.convert(request));
        teamUpdateProducer.updateTeam(team);
        return team;
    }

    public Team get(UUID id) {
        return storage.get(id, Team.class);
    }

    public Team delete(UUID id) {
        return storage.delete(id, Team.class);
    }

    public List<Team> getAll() {
        return storage.getAll(Team.class);
    }

    public List<Team> findByProductArea(UUID productAreaId) {
        return convert(teamRepository.findByProductArea(productAreaId), pos -> pos.getDomainObjectData(Team.class));
    }

    private void validateProductArea(Validator<TeamRequest> validator) {
        TeamRequest request = validator.getItem();
        if (isUUID(request.getProductAreaId())) {
            var poId = UUID.fromString(request.getProductAreaId());
            if (!storage.exists(poId, ProductArea.class)) {
                validator.addError(Fields.productAreaId, "doesNotExist", "Product Area " + poId + " does not exist");
            }
        }
    }

    private void validateNaisTeam(Validator<TeamRequest> validator, String naisTeam) {
        Team existingTeam = validator.getDomainItem();
        if (!(existingTeam != null && existingTeam.getNaisTeams().contains(naisTeam)) && !naisTeamService.teamExists(naisTeam)) {
            validator.addError(Fields.naisTeams, "doesNotExist", "Nais Team " + naisTeam + " does not exist");
        }
    }

    private void validateMembers(Validator<TeamRequest> validator, TeamMemberRequest member) {
        // TODO validate external Ids
    }

    /**
     * Desync nodes with random minute and second
     */
    @Scheduled(cron = "${random.int[0,59]} ${random.int[0,59]} * * * ?")
    public void catchupUpdates() {
        var uptime = Duration.ofMillis(ManagementFactory.getRuntimeMXBean().getUptime());
        if (uptime.minus(Duration.ofMinutes(10)).isNegative()) {
            log.info("Skipping catchupUpdates, uptime {}", uptime.toString());
        }

        List<GenericStorage> unsentUpdates = teamRepository.findUnsentUpdates();
        unsentUpdates.forEach(teamStorage -> {
            var team = teamStorage.getDomainObjectData(Team.class);
            teamUpdateProducer.updateTeam(team);
            storage.save(team);
        });
    }
}
