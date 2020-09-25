package no.nav.data.common.notify;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.Data;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.dto.MailModels.Item;
import no.nav.data.common.notify.dto.MailModels.MemberUpdate;
import no.nav.data.common.notify.dto.MailModels.UpdateItem;
import no.nav.data.common.notify.dto.MailModels.UpdateModel;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.template.FreemarkerConfig.FreemarkerService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.shared.domain.Member;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.Team;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static java.util.Objects.requireNonNull;
import static no.nav.data.common.notify.NotificationMailGenerator.MailTemplates.TEAM_UPDATE;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filterCommonElements;
import static no.nav.data.common.utils.StreamUtils.tryFind;

@Service
public class NotificationMailGenerator {

    public static final String UPDATEMAIL_SOURCE = "updatemail";
    public static final String NUDGEMAIL_SOURCE = "nudgeemail";
    private final boolean dev;

    enum MailTemplates {
        TEAM_UPDATE("team-update.ftl");

        private final String templateName;

        MailTemplates(String template) {
            templateName = template;
        }

    }

    private final FreemarkerService freemarkerService;
    private final LoadingCache<UUID, AuditVersion> auditCache;
    private final LoadingCache<UUID, ProductArea> paCache;
    private final String baseUrl;

    public NotificationMailGenerator(SecurityProperties securityProperties, AuditVersionRepository auditVersionRepository,
            StorageService storageService, FreemarkerService freemarkerService) {
        this.freemarkerService = freemarkerService;
        this.auditCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(5))
                .maximumSize(1000).build(id -> auditVersionRepository.findById(id).orElseThrow());
        this.paCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(1))
                .maximumSize(1000).build(id -> storageService.get(id, ProductArea.class));

        baseUrl = tryFind(securityProperties.getRedirectUris(), uri -> uri.contains("adeo.no")).orElse(securityProperties.getRedirectUris().get(0));
        dev = securityProperties.isDev();
    }

    public Mail updateSummary(NotificationTask task) {
        var model = new UpdateModel();
        model.setBaseUrl(baseUrl);
        model.setTime(task.getTime());

        task.getTargets().forEach(t -> {
            if (t.isCreate()) {
                AuditVersion auditVersion = requireNonNull(auditCache.get(t.getCurrAuditId()));
                model.getCreated().add(new Item(nameForTable(auditVersion), nameFor(auditVersion), urlFor(auditVersion, UPDATEMAIL_SOURCE)));
            } else if (t.isDelete()) {
                AuditVersion auditVersion = requireNonNull(auditCache.get(t.getPrevAuditId()));
                model.getDeleted().add(new Item(nameForTable(auditVersion), nameFor(auditVersion), urlFor(auditVersion, UPDATEMAIL_SOURCE)));
            } else {
                AuditVersion prevVersion = requireNonNull(auditCache.get(t.getPrevAuditId()));
                AuditVersion currVersion = requireNonNull(auditCache.get(t.getCurrAuditId()));
                UpdateItem diff = diffItem(prevVersion, currVersion);
                if (diff.hasChanged()) {
                    model.getUpdated().add(diff);
                }
            }
        });

        String body = freemarkerService.generate(TEAM_UPDATE.templateName, model);
        boolean isEmpty = model.getCreated().isEmpty() && model.getDeleted().isEmpty() && model.getUpdated().isEmpty();
        return new Mail("Teamkatalog oppdatering", body, model, isEmpty);
    }

    private UpdateItem diffItem(AuditVersion prevVersion, AuditVersion currVersion) {
        var item = UpdateItem.builder();
        item.type(nameForTable(currVersion));
        item.url(urlFor(currVersion, UPDATEMAIL_SOURCE));

        var toName = nameFor(currVersion);
        item.fromName(nameFor(prevVersion));
        item.toName(toName).name(toName);

        if (prevVersion.isTeam()) {
            Team prevData = prevVersion.getTeamData();
            Team currData = currVersion.getTeamData();
            item.fromType(Lang.teamType(prevData.getTeamType()));
            item.toType(Lang.teamType(currData.getTeamType()));

            Optional.ofNullable(prevData.getProductAreaId()).map(paCache::get)
                    .ifPresent(pa -> {
                        item.fromProductArea(pa.getName());
                        item.fromProductAreaUrl(urlFor(pa.getClass(), pa.getId(), UPDATEMAIL_SOURCE));
                    });
            Optional.ofNullable(currData.getProductAreaId()).map(paCache::get)
                    .ifPresent(pa -> {
                        item.toProductArea(pa.getName());
                        item.toProductAreaUrl(urlFor(pa.getClass(), pa.getId(), UPDATEMAIL_SOURCE));
                    });
        }
        var fromMembers = members(prevVersion);
        var toMembers = members(currVersion);

        item.removedMembers(convertMember(filterCommonElements(fromMembers, toMembers, Member::getNavIdent)));
        item.newMembers(convertMember(filterCommonElements(toMembers, fromMembers, Member::getNavIdent)));

        return item.build();
    }

    private List<MemberUpdate> convertMember(List<? extends Member> list) {
        return convert(list, m -> new MemberUpdate(resourceUrl(m.getNavIdent(), UPDATEMAIL_SOURCE), NomClient.getInstance().getNameForIdent(m.getNavIdent())));
    }

    private List<Member> members(AuditVersion version) {
        if (version.isTeam()) {
            return List.copyOf(version.getTeamData().getMembers());
        } else if (version.isProductArea()) {
            return List.copyOf(version.getProductAreaData().getMembers());
        }
        return List.of();
    }

    public Mail nudgeTime(Membered domainObject) {
        return new Mail("Teamkatalog påminnelse for " + domainObject.getName(), "", null);
    }

    private String nameForTable(AuditVersion auditVersion) {
        if (auditVersion.isProductArea()) {
            return Lang.PRODUCT_AREA;
        }
        return auditVersion.getTable();
    }

    private String nameFor(AuditVersion auditVersion) {
        if (auditVersion.isTeam()) {
            return auditVersion.getTeamData().getName();
        } else if (auditVersion.isProductArea()) {
            return auditVersion.getProductAreaData().getName();
        }
        return StringUtils.EMPTY;
    }

    private String urlFor(Class<? extends DomainObject> type, UUID id, String source) {
        return baseUrl + "/" + TypeRegistration.typeOf(type).toLowerCase() + "/" + id + "?source=" + source;
    }

    private String urlFor(AuditVersion auditVersion, String source) {
        return baseUrl + "/" + auditVersion.getTable().toLowerCase() + "/" + auditVersion.getTableId() + "?source=" + source;
    }

    private String resourceUrl(String ident, String source) {
        return baseUrl + "/resource/" + ident + "?source=" + source;
    }


    @Data
    public class Mail {

        private final String subject;
        private final String body;
        private final Object model;
        private final boolean empty;

        Mail(String subject, String body, Object model, boolean isEmpty) {
            this.subject = subject + (dev ? " [DEV]" : "");
            this.body = body;
            this.model = model;
            this.empty = isEmpty;
        }

        Mail(String subject, String body, Object model) {
            this(subject, body, model, false);
        }
    }

}
