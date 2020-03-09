package no.nav.data.team.po;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.ValidationException;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.team.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ProductAreaService {

    private final StorageService storage;
    private final TeamRepository teamRepository;

    public ProductAreaService(StorageService storage, TeamRepository teamRepository) {
        this.storage = storage;
        this.teamRepository = teamRepository;
    }

    public ProductArea save(ProductAreaRequest request) {
        Validator.validate(request, storage).ifErrorsThrowValidationException();
        var productArea = request.isUpdate() ? storage.get(request.getIdAsUUID(), ProductArea.class) : new ProductArea();
        return storage.save(productArea.convert(request));
    }

    public ProductArea get(UUID id) {
        return storage.get(id, ProductArea.class);
    }

    public ProductArea delete(UUID id) {
        List<GenericStorage> teams = teamRepository.findByProductArea(id);
        if (!teams.isEmpty()) {
            String message = "Cannot delete product area, it is in use by " + teams.size() + " teams";
            log.debug(message);
            throw new ValidationException(message);
        }
        return storage.delete(id, ProductArea.class);
    }

    public List<ProductArea> getAll() {
        return storage.getAll(ProductArea.class);
    }
}
