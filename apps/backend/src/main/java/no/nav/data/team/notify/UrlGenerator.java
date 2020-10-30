package no.nav.data.team.notify;

import lombok.Getter;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.team.po.domain.ProductArea;
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
        return baseUrl + "/" + urlPathForTable(TypeRegistration.typeOf(type)) + "/" + id;
    }

    public String urlFor(AuditVersion auditVersion) {
        return baseUrl + "/" + urlPathForTable(auditVersion.getTable()) + "/" + auditVersion.getTableId();
    }

    public String resourceUrl(String ident) {
        return baseUrl + "/resource/" + ident;
    }

    private String urlPathForTable(String table) {
        if (table.equals(TypeRegistration.typeOf(ProductArea.class))) {
            return "area";
        }
        return table.toLowerCase();
    }

}
