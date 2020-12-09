package no.nav.data.team.notify;

import lombok.Getter;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.shared.dto.Links.NamedLink;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class UrlGenerator {

    private static final String teamSlackId = "T5LNAMWNA";
    private static final String slackUrl = "https://slack.com/app_redirect?team=%s&channel=%s";

    @Getter
    private final String baseUrl;
    @Getter
    private final boolean dev;

    private static UrlGenerator INSTANCE;

    public UrlGenerator(SecurityProperties securityProperties) {
        baseUrl = securityProperties.findBaseUrl();
        dev = securityProperties.isDev();
        INSTANCE = this;
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

    public List<NamedLink> slackUrls(String slack) {
        return Arrays.stream(slack.replaceAll("[#,]", "")
                .split(" "))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> new NamedLink("#" + s, slackUrl.formatted(teamSlackId, s)))
                .collect(Collectors.toList());
    }

    private String urlPathForTable(String table) {
        if (table.equals(TypeRegistration.typeOf(ProductArea.class))) {
            return "area";
        }
        return table.toLowerCase();
    }

    public static UrlGenerator instance() {
        return INSTANCE;
    }
}
