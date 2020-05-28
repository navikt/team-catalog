package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.graph.GraphService;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.filter;
import static no.nav.data.team.common.validator.Validator.ALREADY_EXISTS;
import static no.nav.data.team.common.validator.Validator.DOES_NOT_EXIST;

@Slf4j
@Service
public class TeamService {

    private final StorageService storage;
    private final NaisTeamService naisTeamService;
    private final TeamRepository teamRepository;
    private final GraphService graphService;

    public TeamService(StorageService storage, NaisTeamService naisTeamService, TeamRepository teamRepository,
            GraphService graphService) {
        this.storage = storage;
        this.naisTeamService = naisTeamService;
        this.teamRepository = teamRepository;
        this.graphService = graphService;
    }

    public Team save(TeamRequest request) {
        Validator.validate(request, storage)
                .addValidations(validator -> validator.checkExists(request.getProductAreaId(), storage, ProductArea.class))
                .addValidations(TeamRequest::getMembers, this::validateMembers)
                .addValidations(TeamRequest::getNaisTeams, this::validateNaisTeam)
                .addValidations(this::validateName)
                .ifErrorsThrowValidationException();

        var team = request.isUpdate() ? storage.get(request.getIdAsUUID(), Team.class) : new Team();

        storage.save(team.convert(request));
        return team;
    }

    public Team get(UUID id) {
        return storage.get(id, Team.class);
    }

    public Team delete(UUID id) {
        Team delete = storage.delete(id, Team.class);
        graphService.deleteTem(delete);
        return delete;
    }

    public List<Team> getAll() {
        return storage.getAll(Team.class);
    }

    public List<Team> findByProductArea(UUID productAreaId) {
        return convert(teamRepository.findByProductArea(productAreaId), GenericStorage::toTeam);
    }

    public List<Team> findByMemberIdent(String memberIdent) {
        return teamRepository.findByMemberIdent(memberIdent.toUpperCase());
    }

    public List<Team> search(String name) {
        return convert(teamRepository.findByNameLike(name), GenericStorage::toTeam);
    }

    private void validateNaisTeam(Validator<TeamRequest> validator, String naisTeam) {
        Team existingTeam = validator.getDomainItem();
        if (!(existingTeam != null && existingTeam.getNaisTeams().contains(naisTeam)) && !naisTeamService.teamExists(naisTeam)) {
            validator.addError(Fields.naisTeams, DOES_NOT_EXIST, "Nais Team " + naisTeam + " does not exist");
        }
    }

    private void validateMembers(Validator<TeamRequest> validator, TeamMemberRequest member) {
        // TODO validate external Ids
    }

    private void validateName(Validator<TeamRequest> validator) {
        String name = validator.getItem().getName();
        if (name == null) {
            return;
        }
        List<GenericStorage> teams = filter(teamRepository.findByName(name), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
        if (teams.stream().anyMatch(t -> t.toTeam().getName().equalsIgnoreCase(name))) {
            validator.addError(Fields.name, ALREADY_EXISTS, "name '" + name + "' already in use");
        }
    }
}
