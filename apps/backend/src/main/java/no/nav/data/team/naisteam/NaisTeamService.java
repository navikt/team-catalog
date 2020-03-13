package no.nav.data.team.naisteam;

import no.nav.data.team.naisteam.domain.NaisTeam;

import java.util.List;
import java.util.Optional;

public interface NaisTeamService {

    List<NaisTeam> getAllTeams();

    Optional<NaisTeam> getTeam(String teamId);

    boolean teamExists(String teamId);
}
