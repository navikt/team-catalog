package no.nav.data.common.notify;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.common.notify.dto.MailModels.Item;
import no.nav.data.common.notify.dto.MailModels.TypedItem;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static no.nav.data.common.notify.NotificationMailGenerator.MailTemplates.TEAM_UPDATE;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filterCommonElements;
import static no.nav.data.common.utils.StreamUtils.tryFind;

@Slf4j
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
        task.getTargets().forEach(this::fetchAuditVersions);

        task.getTargets().forEach(t -> {
            if (t.isCreate()) {
                AuditVersion auditVersion = t.getCurrAuditVersion();
                model.getCreated().add(new TypedItem(nameForTable(auditVersion), urlFor(auditVersion, UPDATEMAIL_SOURCE), nameFor(auditVersion)));
            } else if (t.isDelete()) {
                AuditVersion auditVersion = t.getPrevAuditVersion();
                model.getDeleted().add(new TypedItem(nameForTable(auditVersion), urlFor(auditVersion, UPDATEMAIL_SOURCE), nameFor(auditVersion), true));
            } else {
                AuditVersion prevVersion = t.getPrevAuditVersion();
                AuditVersion currVersion = t.getCurrAuditVersion();
                UpdateItem diff = diffItem(prevVersion, currVersion, task);
                if (diff.hasChanged()) {
                    log.info("Changed {}", diff);
                    model.getUpdated().add(diff);
                } else {
                    log.info("Not changed {}", diff);
                }
            }
        });

        String body = freemarkerService.generate(TEAM_UPDATE.templateName, model);
        boolean isEmpty = model.getCreated().isEmpty() && model.getDeleted().isEmpty() && model.getUpdated().isEmpty();
        return new Mail("Teamkatalog oppdatering", body, model, isEmpty);
    }

    private void fetchAuditVersions(AuditTarget auditTarget) {
        Optional.ofNullable(auditTarget.getPrevAuditId()).ifPresent(id -> auditTarget.setPrevAuditVersion(auditCache.get(id)));
        Optional.ofNullable(auditTarget.getCurrAuditId()).ifPresent(id -> auditTarget.setCurrAuditVersion(auditCache.get(id)));
    }

    private UpdateItem diffItem(AuditVersion prevVersion, AuditVersion currVersion, NotificationTask task) {
        var item = UpdateItem.builder();

        var toName = nameFor(currVersion);
        item.fromName(nameFor(prevVersion));
        item.toName(toName);
        item.item(new TypedItem(nameForTable(currVersion), urlFor(currVersion, UPDATEMAIL_SOURCE), toName));

        if (prevVersion.isTeam()) {
            Team prevData = prevVersion.getTeamData();
            Team currData = currVersion.getTeamData();
            item.fromType(Lang.teamType(prevData.getTeamType()));
            item.toType(Lang.teamType(currData.getTeamType()));

            if (!Objects.equals(prevData.getProductAreaId(), currData.getProductAreaId())) {
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
        }
        if (prevVersion.isProductArea()) {
            var newTeams = new ArrayList<AuditTarget>();
            var removedTeams = new ArrayList<AuditTarget>();
            var paId = UUID.fromString(prevVersion.getTableId());
            // Task with productArea targets will contain all it's teams' targets
            var teamTargets = task.getTargets().stream()
                    .filter(AuditTarget::isTeam)
                    .filter(t -> paId.equals(paIdForTeamAudit(t.getPrevAuditVersion())) || paId.equals(paIdForTeamAudit(t.getCurrAuditVersion())))
                    .collect(Collectors.toList());

            log.info("Looking into teams for pa {} {} of {} total targets", paId, teamTargets, task.getTargets().size());

            teamTargets.forEach(t -> {
                if (t.isCreate() || !paId.equals(paIdForTeamAudit(t.getPrevAuditVersion()))) {
                    log.info("Team added {}", t.getTargetId());
                    newTeams.add(t);
                } else if (t.isDelete() || !paId.equals(paIdForTeamAudit(t.getCurrAuditVersion()))) {
                    log.info("Team removed {}", t.getTargetId());
                    removedTeams.add(t);
                }
            });
            item.newTeams(convert(newTeams, teamTarget -> new Item(urlFor(Team.class, teamTarget.getTargetId(), UPDATEMAIL_SOURCE), teamNameFor(teamTarget))));
            item.removedTeams(
                    convert(removedTeams, teamTarget -> new Item(urlFor(Team.class, teamTarget.getTargetId(), UPDATEMAIL_SOURCE), teamNameFor(teamTarget), teamTarget.isDelete())));
        }
        var fromMembers = members(prevVersion);
        var toMembers = members(currVersion);

        item.removedMembers(convertMember(filterCommonElements(fromMembers, toMembers, Member::getNavIdent)));
        item.newMembers(convertMember(filterCommonElements(toMembers, fromMembers, Member::getNavIdent)));

        return item.build();
    }

    private String teamNameFor(AuditTarget teamTarget) {
        return teamTarget.isCreate() || teamTarget.isUpdate() ? teamTarget.getCurrAuditVersion().getTeamData().getName()
                : teamTarget.getPrevAuditVersion().getTeamData().getName();
    }

    private UUID paIdForTeamAudit(AuditVersion auditVersion) {
        return auditVersion == null ? null : auditVersion.getTeamData().getProductAreaId();
    }

    private List<Item> convertMember(List<? extends Member> list) {
        return convert(list, m -> new Item(resourceUrl(m.getNavIdent(), UPDATEMAIL_SOURCE), NomClient.getInstance().getNameForIdent(m.getNavIdent())));
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
