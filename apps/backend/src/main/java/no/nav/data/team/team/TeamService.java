package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.nullToEmptyList;
import static no.nav.data.team.common.utils.StringUtils.isUUID;

@Slf4j
@Service
public class TeamService {

    private final StorageService storage;
    private final NaisTeamService naisTeamService;

    public TeamService(StorageService storage, NaisTeamService naisTeamService) {
        this.storage = storage;
        this.naisTeamService = naisTeamService;
    }

    public Team save(TeamRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateProductArea)
                .addValidations(validator -> nullToEmptyList(request.getMembers()).forEach(member -> validateMembers(validator, member)))
                .addValidations(validator -> nullToEmptyList(request.getNaisTeams()).forEach(naisTeam -> validateNaisTeam(validator, naisTeam)))
                .ifErrorsThrowValidationException();

        var team = request.isUpdate() ? storage.get(request.getIdAsUUID(), Team.class) : new Team();
        return storage.save(team.convert(request));
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
}
