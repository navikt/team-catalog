package no.nav.data.team.shared.domain;

import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.team.domain.TeamRole;

import java.util.List;

public interface Member {

    String getNavIdent();

    List<TeamRole> getRoles();

    MemberResponse convertToResponse();
}
