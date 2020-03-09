package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.utils.StringUtils;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StringUtils.isUUID;

@Slf4j
@Service
public class TeamService {

    private final StorageService storage;

    public TeamService(StorageService storage) {
        this.storage = storage;
    }

    public Team save(TeamRequest request) {
        Validator.validate(request, storage).addValidations(this::validateProductArea).ifErrorsThrowValidationException();
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
        if (request.getProductAreaId() != null && isUUID(request.getProductAreaId())) {
            var poId = StringUtils.toUUID(request.getProductAreaId());
            if (!storage.exists(poId, ProductArea.class)) {
                validator.addError(Fields.productAreaId, "doesNotExist", "Product Area " + poId + " does not exist");
            }

        }
    }
}
