package no.nav.data.common.notify;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.AllArgsConstructor;
import lombok.Data;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.template.FreemarkerConfig.FreemarkerService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.Team;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.utils.StreamUtils.tryFind;

@Service
public class NotificationMailGenerator {

    enum MailTemplates {
        TEAM_UPDATE("team-update.ftl");

        private final String templateName;

        MailTemplates(String template) {
            templateName = template;
        }

    }

    private final FreemarkerService freemarkerService;
    private final LoadingCache<UUID, AuditVersion> auditCache;
    private final String baseUrl;

    private static final String TEAM = TypeRegistration.typeOf(Team.class);
    private static final String PA = TypeRegistration.typeOf(ProductArea.class);

    public NotificationMailGenerator(SecurityProperties securityProperties, AuditVersionRepository auditVersionRepository,
            FreemarkerService freemarkerService) {
        this.freemarkerService = freemarkerService;
        this.auditCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(5))
                .maximumSize(1000).build(id -> auditVersionRepository.findById(id).orElseThrow());

        baseUrl = tryFind(securityProperties.getRedirectUris(), uri -> uri.contains("adeo.no")).orElse(securityProperties.getRedirectUris().get(0));
    }

    public String updateSummary(NotificationTask task) {
        var time = task.getTime();
        var targets = task.getTargets();

        var model = new UpdateModel();
        model.setTime(time);

        targets.forEach(t -> {
            if (t.getPrevAuditId() == null) {
                AuditVersion auditVersion = requireNonNull(auditCache.get(t.getCurrAuditId()));
                model.getCreated().add(new Item(nameForTable(auditVersion), nameFor(auditVersion), urlFor(auditVersion)));
            } else if (t.getCurrAuditId() == null) {
                AuditVersion auditVersion = requireNonNull(auditCache.get(t.getPrevAuditId()));
                model.getDeleted().add(new Item(nameForTable(auditVersion), nameFor(auditVersion), urlFor(auditVersion)));
            } else {
                AuditVersion auditVersion = requireNonNull(auditCache.get(t.getCurrAuditId()));
                model.getUpdated().add(new Item(nameForTable(auditVersion), nameFor(auditVersion), urlFor(auditVersion)));
            }
        });

        return freemarkerService.generate(MailTemplates.TEAM_UPDATE.templateName, model);
    }

    private String nameForTable(AuditVersion auditVersion) {
        if (PA.equals(auditVersion.getTable())) {
            return Lang.PRODUCT_AREA;
        }
        return auditVersion.getTableId();
    }

    public String nudgeBody(Membered domainObject) {
        return "";
    }

    private String nameFor(AuditVersion auditVersion) {
        if (nameForTable(auditVersion).equals(TEAM)) {
            return auditVersion.getDomainObjectData(Team.class).getName();
        } else if (nameForTable(auditVersion).equals(PA)) {
            return auditVersion.getDomainObjectData(ProductArea.class).getName();
        }
        return StringUtils.EMPTY;
    }

    private String urlFor(AuditVersion auditVersion) {
        return baseUrl + "/" + nameForTable(auditVersion).toLowerCase() + "/" + auditVersion.getTableId();
    }

    @Data
    public static class UpdateModel {

        private NotificationTime time;

        private List<Item> created = new ArrayList<>();
        private List<Item> updated = new ArrayList<>();
        private List<Item> deleted = new ArrayList<>();

    }

    @Data
    @AllArgsConstructor
    public static class Item {

        private String type;
        private String name;
        private String url;
    }
}
