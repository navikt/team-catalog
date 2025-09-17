package no.nav.data.team.po;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.cluster.ClusterRepository;
import no.nav.data.team.org.OrgService;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.AddTeamsToProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.TeamRepository;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import no.nav.nom.graphql.model.OrgEnhetDto;
import no.nav.nom.graphql.model.OrgEnhetsLederDto;
import no.nav.nom.graphql.model.OrganiseringDto;
import no.nav.nom.graphql.model.RessursDto;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.groupingBy;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.validator.Validator.*;

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

    public ProductArea save(ProductAreaRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateArbeidsomraade)
                .addValidations(this::validateName)
                .addValidations(this::validateStatusNotNull)
                .ifErrorsThrowValidationException();
        var productArea = request.isUpdate() ? storage.get(request.getIdAsUUID(), ProductArea.class) : new ProductArea();
        var avdelingNomId = orgService.getAvdelingNomId(request.getNomId());
        var orgEnhetOgUnderEnheter = orgService.getOrgEnhetOgUnderEnheter(request.getNomId());
        setOwnerGroup(request, orgEnhetOgUnderEnheter);
        return storage.save(productArea.convert(request, avdelingNomId));
    }

    private void validateArbeidsomraade(Validator<ProductAreaRequest> productAreaRequestValidator) {
        if (productAreaRequestValidator.getItem().getAreaType().equals(AreaType.PRODUCT_AREA)
                && productAreaRequestValidator.getItem().getNomId() != null
                && !orgService.isOrgEnhetInArbeidsomraadeOgDirektorat(productAreaRequestValidator.getItem().getNomId())) {
            productAreaRequestValidator.addError("status", ILLEGAL_ARGUMENT, "Product area must be in arbeidsomraade and directorate");
        }
    }

    private void validateStatusNotNull(Validator<ProductAreaRequest> productAreaRequestValidator) {
        if(productAreaRequestValidator.getItem().getStatus() == null){
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
        return getAll().stream().filter(po-> po.getStatus() == DomainObjectStatus.ACTIVE).toList();
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

    private void setOwnerGroup(ProductAreaRequest request, OrgEnhetDto orgEnhetDtos) {
        log.info("Request {} og orgEnhetDtos {}", request, orgEnhetDtos);
        if (orgEnhetDtos != null) {
            var lederNavident = orgEnhetDtos.getLeder().getFirst().getRessurs().getNavident();
            log.info("setOwnerGroup: orgEnhetDtos {}", orgEnhetDtos);
            request.getOwnerGroup().setOwnerNavId(lederNavident);
            log.info("OwnerNavId set to {}", request.getOwnerGroup().getOwnerNavId());
            var ledereNavIdent = orgEnhetDtos.getOrganiseringer().stream()
                    .map(OrganiseringDto::getOrgEnhet)
                    .map(OrgEnhetDto::getLeder)
                    .flatMap(Collection::stream)
                    .map(OrgEnhetsLederDto::getRessurs)
                    .map(RessursDto::getNavident)
                    .filter(navident -> !navident.equals(request.getOwnerGroup().getOwnerNavId()))
                    .toList();

            var ledereOgOrgEnhetNavn = orgEnhetDtos.getOrganiseringer().stream()
                    .map(OrganiseringDto::getOrgEnhet)
                    .collect(groupingBy(
                            orgEnhetDto -> orgEnhetDto.getLeder().getFirst().getRessurs().getNavident(),
                            Collectors.mapping(OrgEnhetDto::getNavn, Collectors.toList())
                    ));
            if (ledereOgOrgEnhetNavn.containsKey(lederNavident)) {
                ledereOgOrgEnhetNavn.get(lederNavident).add(orgEnhetDtos.getNavn());
            } else {
                ledereOgOrgEnhetNavn.put(lederNavident, List.of(orgEnhetDtos.getNavn()));
            }
            log.info("LedereNavIdent={}", ledereNavIdent);

            request.getOwnerGroup().setNomOwnerGroupMemberNavIdList(ledereNavIdent);
            if (request.getOwnerGroup().getOwnerGroupMemberNavIdList() != null && !request.getOwnerGroup().getOwnerGroupMemberNavIdList().isEmpty()) {
                log.info("Removing members from owner group that are also in ledereNavIdent: {}", request.getOwnerGroup().getOwnerGroupMemberNavIdList());
                request.getOwnerGroup().getOwnerGroupMemberNavIdList().removeIf(ledereNavIdent::contains);
            }
            request.getOwnerGroup().setNomOwnerGroupMemberOrganizationNameMap(ledereOgOrgEnhetNavn);

            log.info("Setting owner group for ProductArea {} with ownerNavId {} and members {}",
                    request.getName(), request.getOwnerGroup().getOwnerNavId(), request.getOwnerGroup().getNomOwnerGroupMemberNavIdList());
        }
    }
}
