package no.nav.data.common.notify;

import lombok.Getter;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.TypeRegistration;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UrlGenerator {

    @Getter
    private final String baseUrl;
    @Getter
    private final boolean dev;

    public UrlGenerator(SecurityProperties securityProperties) {
        baseUrl = securityProperties.findBaseUrl();
        dev = securityProperties.isDev();
    }

    public String urlFor(Class<? extends DomainObject> type, UUID id) {
        return baseUrl + "/" + TypeRegistration.typeOf(type).toLowerCase() + "/" + id;
    }

    public String urlFor(AuditVersion auditVersion) {
        return baseUrl + "/" + auditVersion.getTable().toLowerCase() + "/" + auditVersion.getTableId();
    }

    public String resourceUrl(String ident) {
        return baseUrl + "/resource/" + ident;
    }


}
