package no.nav.data.team.po;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.cluster.ClusterRepository;
import no.nav.data.team.org.OrgService;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.AddTeamsToProductAreaRequest;
import no.nav.data.team.po.dto.PaMemberRequest;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.TeamRepository;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import no.nav.nom.graphql.model.OrgEnhetDto;
import no.nav.nom.graphql.model.OrganiseringDto;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;
import static java.util.stream.Collectors.groupingBy;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.validator.Validator.ERROR_MESSAGE_MISSING;
import static no.nav.data.common.validator.Validator.ILLEGAL_ARGUMENT;

@Slf4j
@Service
public class ProductAreaService {

    private final StorageService storage;
    private final TeamRepository teamRepository;
    private final ClusterRepository clusterRepository;
    private final ProductAreaRepository repository;
    private final OrgService orgService;

    public ProductAreaService(StorageService storage, TeamRepository teamRepository,
                              ClusterRepository clusterRepository, ProductAreaRepository repository, OrgService orgService) {
        this.storage = storage;
        this.teamRepository = teamRepository;
        this.clusterRepository = clusterRepository;
        this.repository = repository;
        this.orgService = orgService;
    }

    @Scheduled(cron = "0 0 6,11,17,23 * * *")
    private void updateOwnerGroup() {
        List<ProductAreaRequest> allProductAreasAsRequests =
                repository.findAllProductAreas().stream()
                        .map(GenericStorage::toProductArea)
                        .filter(productArea -> productArea.getAreaType().equals(AreaType.PRODUCT_AREA))
                        .filter(productArea -> productArea.getStatus().isActive())
                        .filter(productArea -> nonNull(productArea.getNomId()))
                        .map(ProductAreaRequest::convertToRequest)
                        .toList();
        allProductAreasAsRequests.forEach(request -> {
            try{
                save(request);
            } catch (ValidationException ex) {
                log.warn("ValidationException, Failed to update product area " + request.getId(), ex);
            } catch (RuntimeException ex) {
                log.warn("Misc exception, Failed to update product area " + request.getId(), ex);
            }
        });
    }

    @EventListener
    private void updateOwnerGroupOnStartup(AvailabilityChangeEvent<ReadinessState> event) {
        var ready = event.getState().equals(ReadinessState.ACCEPTING_TRAFFIC);
        if (ready) {
            updateOwnerGroup();
        }
    }

    public ProductArea save(ProductAreaRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateArbeidsomraade)
                .addValidations(this::validateName)
                .addValidations(this::validateStatusNotNull)
                .addValidations(this::validateProductAreaMemberRoleOk)
                .addValidations(this::validateProductMemberAreaNoDuplicates)
                .ifErrorsThrowValidationException();
        var productArea = request.isUpdate() ? storage.get(request.getIdAsUUID(), ProductArea.class) : new ProductArea();

        var members = request.getMembers() == null ? productArea.getMembers() : request.getMembers().stream().map(PaMember::convert).toList();
        if (request.getAreaType().equals(AreaType.PRODUCT_AREA)) {
            members = determineMembersToPersistForProductArea(request, productArea);
        }else if (members == null){
            members = List.of(); // if current (prior to update) members are not present, start with empty list
        }

        var avdelingNomId = orgService.getAvdelingNomId(request.getNomId());
        productArea.setFieldsFromRequest(request, avdelingNomId, members);
        return storage.save(productArea);
    }

    private void validateProductMemberAreaNoDuplicates(Validator<ProductAreaRequest> productAreaRequestValidator) {
        var req = productAreaRequestValidator.getItem();

        if(req.getMembers() == null){
            return;
        }

        var duplicateNavIdentEntries = req.getMembers().stream().collect(Collectors.groupingBy(PaMemberRequest::getNavIdent, Collectors.counting()))
                .entrySet().stream()
                .filter(y -> y.getValue() > 1)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        if (!duplicateNavIdentEntries.isEmpty()) {
            var errMsg = duplicateNavIdentEntries.entrySet().stream().map(it -> it.getKey() + ":" + it.getValue()).collect(Collectors.joining(", "));
            productAreaRequestValidator.addError(Fields.members, ILLEGAL_ARGUMENT, "Cannot accept duplicate navident entries: " + errMsg);
        }
    }

    private void validateProductAreaMemberRoleOk(Validator<ProductAreaRequest> validator) {
        var members = validator.getItem().getMembers();
        if (members == null) return;
        for (var member : members) {
            var roles = member.getRoles();
            if (roles == null) continue;
            for (var role : roles) {
                if (role.isLeaderGroupRole()) {
                    validator.addError("members", ILLEGAL_ARGUMENT, String.format("Role '%s' is not applicable for seksjon member", role));
                }
            }
        }
    }

    private void validateArbeidsomraade(Validator<ProductAreaRequest> productAreaRequestValidator) {
        if (productAreaRequestValidator.getItem().getAreaType().equals(AreaType.PRODUCT_AREA)
                && productAreaRequestValidator.getItem().getNomId() != null
                && !orgService.isOrgEnhetInArbeidsomraadeOgDirektorat(productAreaRequestValidator.getItem().getNomId())) {
            productAreaRequestValidator.addError("status", ILLEGAL_ARGUMENT, "Product area must be in arbeidsomraade and directorate");
        }
    }

    private void validateStatusNotNull(Validator<ProductAreaRequest> productAreaRequestValidator) {
        if (productAreaRequestValidator.getItem().getStatus() == null) {
            productAreaRequestValidator.addError("status", ILLEGAL_ARGUMENT, "Status cannot be null");
        }
    }

    public ProductArea get(UUID id) {
        return storage.get(id, ProductArea.class);
    }

    public ProductArea getByNomId(String id) {
        return repository.findByNomId(id).map(GenericStorage::toProductArea).orElse(null);
    }

    public List<ProductArea> search(String name) {
        return convert(repository.findByNameLike(name), GenericStorage::toProductArea);
    }

    public ProductArea delete(UUID id) {
        List<GenericStorage> teams = teamRepository.findByProductArea(id);
        if (!teams.isEmpty()) {
            String message = "Cannot delete product area, it is in use by " + teams.size() + " teams";
            log.debug(message);
            throw new ValidationException(message);
        }
        List<GenericStorage> clusters = clusterRepository.findByProductArea(id);
        if (!clusters.isEmpty()) {
            String message = "Cannot delete product area, it is in use by " + clusters.size() + " clusters";
            log.debug(message);
            throw new ValidationException(message);
        }
        return storage.delete(id, ProductArea.class);
    }

    public List<ProductArea> getAll() {
        return storage.getAll(ProductArea.class);
    }

    public List<ProductArea> getAllActive() {
        return getAll().stream().filter(po -> po.getStatus() == DomainObjectStatus.ACTIVE).toList();
    }

    public void addTeams(AddTeamsToProductAreaRequest request) {
        Validator.validate(request)
                .addValidations(validator -> validator.checkExists(request.getProductAreaId(), storage, ProductArea.class))
                .addValidations(AddTeamsToProductAreaRequest::getTeamIds, (validator, teamId) -> validator.checkExists(teamId, storage, Team.class))
                .ifErrorsThrowValidationException();

        request.getTeamIds().forEach(teamId -> {
            var team = storage.get(UUID.fromString(teamId), Team.class);
            team.setProductAreaId(request.productAreaIdAsUUID());
            team.setUpdateSent(false);
            storage.save(team);
        });
    }

    private void validateName(Validator<ProductAreaRequest> validator) {
        String name = validator.getItem().getName();
        if (name == null || name.isEmpty()) {
            validator.addError(Fields.name, ERROR_MESSAGE_MISSING, "Name is required");
        }
    }

    private List<PaMember> determineMembersToPersistForProductArea(ProductAreaRequest request, ProductArea previousProductArea) {
        var orgEnhetDtos = orgService.getOrgEnhetOgUnderEnheter(request.getNomId());

        ProductAreaMemberAccumulator.Organizational organizational = null;

        if (orgEnhetDtos != null) {
            // todo, just throw error in the opposite case, if nomID is essentially invalid?
            var lederNavident = orgEnhetDtos.getLedere().getFirst().getRessurs().getNavident();

            var underEnheter = orgEnhetDtos.getOrganiseringer().stream()
                    .map(OrganiseringDto::getOrgEnhet).toList();

            var ledereOgOrgEnhetNavn = underEnheter.stream()
                    .collect(groupingBy(
                            underEnhetDto -> underEnhetDto.getLedere().getFirst().getRessurs().getNavident(),
                            Collectors.mapping(OrgEnhetDto::getNavn, Collectors.toList())
                    ));

            organizational = new ProductAreaMemberAccumulator.Organizational(lederNavident, ledereOgOrgEnhetNavn);
        }

        var maybeRequestMembers = request.getMembers() == null ?  new ArrayList<PaMemberRequest>() : request.getMembers();
        var paMembersInRequest = maybeRequestMembers.stream().map(PaMember::convert).toList();
        return ProductAreaMemberAccumulator
                .accumulate(
                        new ProductAreaMemberAccumulator.Original(previousProductArea.getMembers(), previousProductArea.getOwnerGroupNavidentList()),
                        new ProductAreaMemberAccumulator.Updated(paMembersInRequest, request.getOwnerGroupNavidentList()),
                        organizational
                )
                .membersToPersist();
    }
}
