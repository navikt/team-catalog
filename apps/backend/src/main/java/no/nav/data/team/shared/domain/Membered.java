package no.nav.data.team.shared.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import no.nav.data.common.storage.domain.DomainObject;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public interface Membered extends DomainObject {

    String getName();

    List<? extends Member> getMembers();

    @JsonIgnore
    default List<Member> getMembersAsSuper() {
        return new ArrayList<>(getMembers());
    }

    LocalDateTime getLastNudge();

}
