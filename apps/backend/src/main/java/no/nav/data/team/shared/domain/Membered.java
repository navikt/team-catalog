package no.nav.data.team.shared.domain;

import java.util.List;

public interface Membered {

    String getName();

    List<? extends Member> getMembers();
}
