package no.nav.data.team.resource.domain;

import no.nav.data.team.resource.domain.ResourceRepositoryImpl.Membership;

import java.util.List;

public interface ResourceRepositoryCustom {

    Membership findByMemberIdent(String memberIdent);

    List<Membership> findAllByMemberIdents(List<String> memberIdent);

}
