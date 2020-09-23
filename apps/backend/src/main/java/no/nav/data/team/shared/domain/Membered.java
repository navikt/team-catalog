package no.nav.data.team.shared.domain;

import no.nav.data.common.storage.domain.DomainObject;

import java.time.LocalDateTime;
import java.util.List;

public interface Membered extends DomainObject {

    String getName();

    List<? extends Member> getMembers();

    LocalDateTime getLastNudge();

}
