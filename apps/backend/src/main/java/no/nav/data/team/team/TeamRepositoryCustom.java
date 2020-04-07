package no.nav.data.team.team;

import no.nav.data.team.team.domain.Team;

import java.util.List;

public interface TeamRepositoryCustom {

    List<Team> findByMemberIdent(String memberIdent);

}
