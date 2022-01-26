package no.nav.data.team.shared.domain;

import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.team.team.domain.DomainObjectStatus;

public interface HistorizedDomainObject extends DomainObject {

    public DomainObjectStatus getStatus();
}
