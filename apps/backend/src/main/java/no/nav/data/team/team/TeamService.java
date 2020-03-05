package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class TeamService {

    private final StorageService storage;

    public TeamService(StorageService storage) {
        this.storage = storage;
    }

    public Team save(TeamRequest request) {
        request.runValidation(storage).ifErrorsThrowValidationException();
        var team = request.isUpdate() ? storage.get(request.getIdAsUUID(), Team.class) : new Team();
        return storage.save(team.convert(request));
    }

    public Team get(UUID id) {
        return storage.get(id, Team.class);
    }

    public Team delete(UUID id) {
        return storage.delete(id, Team.class);
    }
}
