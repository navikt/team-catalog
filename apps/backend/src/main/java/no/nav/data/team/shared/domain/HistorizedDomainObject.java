package no.nav.data.team.shared.domain;

import no.nav.data.common.storage.domain.DomainObject;

public interface HistorizedDomainObject extends DomainObject {

    public DomainObjectStatus getStatus();
}
