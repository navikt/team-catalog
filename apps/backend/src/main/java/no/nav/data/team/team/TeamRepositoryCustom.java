package no.nav.data.team.team;

import no.nav.data.team.team.domain.Team;

import java.util.List;
import java.util.UUID;

public interface TeamRepositoryCustom {

    List<Team> findByCluster(UUID clusterId);

    List<Team> findByNaisTeam(String naisTeam);
}
