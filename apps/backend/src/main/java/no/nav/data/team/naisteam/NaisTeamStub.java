package no.nav.data.team.naisteam;

import no.nav.data.team.naisteam.domain.NaisTeam;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@ConditionalOnMissingBean(NaisTeamService.class)
public class NaisTeamStub implements NaisTeamService {

    @Override
    public List<NaisTeam> getAllTeams() {
        return List.of();
    }

    @Override
    public Optional<NaisTeam> getTeam(String teamId) {
        return Optional.empty();
    }

    @Override
    public boolean teamExists(String teamId) {
        return false;
    }

    @Override
    public List<NaisTeam> search(String name) {
        return getAllTeams();
    }
}
