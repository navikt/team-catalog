package no.nav.data.team.resource.domain;

import no.nav.data.team.resource.domain.ResourceRepositoryImpl.Membership;

import java.util.List;
import java.util.Map;

public interface ResourceRepositoryCustom {

    Membership findByMemberIdent(String memberIdent);

    Map<String, Membership> findAllByMemberIdents(List<String> memberIdent);

}
