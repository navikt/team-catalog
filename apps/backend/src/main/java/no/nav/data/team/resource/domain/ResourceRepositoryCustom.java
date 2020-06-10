package no.nav.data.team.resource.domain;

import no.nav.data.team.resource.domain.ResourceRepositoryImpl.Membership;

public interface ResourceRepositoryCustom {

    Membership findByMemberIdent(String memberIdent);

}
