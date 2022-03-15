package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import lombok.val;
import no.nav.data.common.TeamCatalogProps;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.graph.GraphService;
import no.nav.data.team.location.LocationRepository;
import no.nav.data.team.location.domain.LocationType;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.dto.TeamMemberRequest;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.validator.Validator.*;

@Slf4j
@Service
public class TeamService {

    private final StorageService storage;
    private final NaisTeamService naisTeamService;
    private final NomClient nomClient;
    private final TeamRepository teamRepository;
    private final GraphService graphService;
    private final LocationRepository locationRepository;

    @Autowired
    private TeamCatalogProps teamCatalogProps;

    public TeamService(StorageService storage, NaisTeamService naisTeamService, NomClient nomClient, TeamRepository teamRepository,
            GraphService graphService, LocationRepository locationRepository) {
        this.storage = storage;
        this.naisTeamService = naisTeamService;
        this.nomClient = nomClient;
        this.teamRepository = teamRepository;
        this.graphService = graphService;
        this.locationRepository = locationRepository;
    }

    public Team save(TeamRequest request) {
        if (request.getProductAreaId() == null) {
            request.setProductAreaId(teamCatalogProps.getDefaultProductareaUuid());
        }
        Validator.validate(request, storage)
                .addValidations(validator -> validator.checkExists(request.getProductAreaId(), storage, ProductArea.class))
                .addValidations(validator -> getaVoid(request, validator))
                .addValidations(TeamRequest::getMembers, this::validateMembers)
                .addValidation(TeamRequest::getContactPersonIdent, this::validateContactPerson)
                .addValidations(TeamRequest::getNaisTeams, this::validateNaisTeam)
                .addValidations(this::validateName)
                .addValidations(this::validateTeamOwner)
                .addValidations(this::validateLocationCode)
                .ifErrorsThrowValidationException();

        var team = request.isUpdate() ? storage.get(request.getIdAsUUID(), Team.class) : new Team();

        storage.save(team.convert(request));
        return team;
    }

    private void getaVoid(TeamRequest request, Validator<TeamRequest> validator) {
        request.getClusterIds().forEach(cId -> validator.checkExists(cId, storage, Cluster.class));
    }

    public Team get(UUID id) {
        return storage.get(id, Team.class);
    }

    public Team delete(UUID id) {
        Team delete = storage.delete(id, Team.class);
        //graphService.deleteTeam(delete);
        return delete;
    }

    public List<Team> getAll() {
        return storage.getAll(Team.class);
    }

    public List<Team> findByProductArea(UUID productAreaId) {
        return convert(teamRepository.findByProductArea(productAreaId), GenericStorage::toTeam);
    }

    public List<Team> findByCluster(UUID clusterId) {
        return teamRepository.findByCluster(clusterId);
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
        var existingMembers = validator.getDomainItem() == null ? List.<TeamMember>of() : validator.getDomainItem(Team.class).getMembers();
        validateIdent(validator, member.getNavIdent(), Fields.members, convert(existingMembers, TeamMember::getNavIdent));
    }

    private void validateContactPerson(Validator<TeamRequest> validator, String ident) {
        List<String> existingIdents = Optional.ofNullable(validator.getDomainItem(Team.class)).map(Team::getContactPersonIdent).map(List::of).orElse(List.of());
        validateIdent(validator, ident, Fields.contactPersonIdent, existingIdents);
    }

    private void validateIdent(Validator<TeamRequest> validator, String ident, String fieldName, List<String> existingIdents) {
        if (ident == null) {
            return;
        }
        if (existingIdents.stream().noneMatch(m -> m.equals(ident)) && nomClient.getByNavIdent(ident).isEmpty()) {
            validator.addError(fieldName, DOES_NOT_EXIST, "Resource " + ident + " does not exist");
        }
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

    private void validateTeamOwner(Validator<TeamRequest> validator) {
        var teamRequest = validator.getItem();
        var teamInDefaultProductArea = teamCatalogProps.getDefaultProductareaUuid().
                equals(teamRequest.getProductAreaId());
        if(teamInDefaultProductArea){
            if(teamRequest.getTeamOwnerIdent() != null){
                validateIdent(validator,teamRequest.getTeamOwnerIdent(), Fields.teamOwnerIdent, List.of());
            }
        }else{
            if(teamRequest.getTeamOwnerIdent() != null) {
                var errMsg = "Cannot specify teamOwner for team in non-default product-area.";
                validator.addError(Fields.teamOwnerIdent, ILLEGAL_ARGUMENT, errMsg);
            }
        }
    }

    private void validateLocationCode(Validator<TeamRequest> validator){
        val officeHours = validator.getItem().getOfficeHours();
        if(officeHours != null){
            if(officeHours.getDays().contains(DayOfWeek.SATURDAY) || officeHours.getDays().contains(DayOfWeek.SUNDAY)){
                validator.addError(Fields.officeHours, ILLEGAL_ARGUMENT, "Officehours can't be on saturdays or sundays");
            }

            val location = locationRepository.getLocationByCode(officeHours.getLocationCode());
            if(location.isEmpty()){
                validator.addError(Fields.officeHours, DOES_NOT_EXIST, "Location for given location code does not exist.");
            }
            if(location.filter(l -> !l.getType().equals(LocationType.FLOOR)).isPresent()){
                validator.addError(Fields.officeHours, ILLEGAL_ARGUMENT, "Team location must be of type FLOOR");
            }
        }
    }
}
