package no.nav.data.team.notify;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.LoadingCache;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.team.notify.dto.MailModels.InactiveModel;
import no.nav.data.team.notify.dto.MailModels.Item;
import no.nav.data.team.notify.dto.MailModels.NudgeModel;
import no.nav.data.team.notify.dto.MailModels.TypedItem;
import no.nav.data.team.notify.dto.MailModels.UpdateItem;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.shared.domain.Member;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filterCommonElements;

@Slf4j
@Service
public class NotificationMessageGenerator {

    private final LoadingCache<UUID, AuditVersion> auditCache;
    private final LoadingCache<UUID, ProductArea> paCache;
    private final UrlGenerator urlGenerator;
    private final NomClient nomClient;

    public NotificationMessageGenerator(AuditVersionRepository auditVersionRepository,
            StorageService storageService, UrlGenerator urlGenerator, NomClient nomClient) {
        this.auditCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(5))
                .maximumSize(1000).build(id -> auditVersionRepository.findById(id).orElseThrow());
        this.paCache = Caffeine.newBuilder().recordStats()
                .expireAfterAccess(Duration.ofMinutes(1))
                .maximumSize(1000).build(id -> storageService.get(id, ProductArea.class));

        this.urlGenerator = urlGenerator;
        this.nomClient = nomClient;
    }

    public NotificationMessage<UpdateModel> updateSummary(NotificationTask task) {
        var model = new UpdateModel();
        model.setBaseUrl(urlGenerator.getBaseUrl());
        model.setTime(task.getTime());
        task.getTargets().forEach(this::fetchAuditVersions);

        task.getTargets().forEach(t -> {
            if (t.isSilent()) {
                // target is here only for calculating other diffs, ie. teams in/out of product area
                return;
            }
            if (t.isCreate()) {
                AuditVersion auditVersion = t.getCurrAuditVersion();
                model.getCreated().add(new TypedItem(nameForTable(auditVersion), urlGenerator.urlFor(auditVersion), nameFor(auditVersion)));
            } else if (t.isDelete()) {
                AuditVersion auditVersion = t.getPrevAuditVersion();
                model.getDeleted().add(new TypedItem(nameForTable(auditVersion), urlGenerator.urlFor(auditVersion), nameFor(auditVersion), true));
            } else if (t.isEdit()) { // is edit check -> temp fix due to scheduler bug
                AuditVersion prevVersion = t.getPrevAuditVersion();
                AuditVersion currVersion = t.getCurrAuditVersion();
                UpdateItem diff = diffItem(prevVersion, currVersion, task);
                if (diff.hasChanged()) {
                    model.getUpdated().add(diff);
                }
            }
        });

        boolean isEmpty = model.getCreated().isEmpty() && model.getDeleted().isEmpty() && model.getUpdated().isEmpty();
        return new NotificationMessage<>("Teamkatalog oppdatering", model, urlGenerator.isDev(), isEmpty);
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
        item.item(new TypedItem(nameForTable(currVersion), urlGenerator.urlFor(currVersion), toName));

        if (prevVersion.isTeam()) {
            Team prevData = prevVersion.getTeamData();
            Team currData = currVersion.getTeamData();
            item.fromType(Lang.teamType(prevData.getTeamType()));
            item.toType(Lang.teamType(currData.getTeamType()));

            if (!Objects.equals(prevData.getProductAreaId(), currData.getProductAreaId())) {
                Optional.ofNullable(prevData.getProductAreaId()).map(this::getPa)
                        .ifPresent(pa -> {
                            item.fromProductArea(pa.getName());
                            item.fromProductAreaUrl(urlGenerator.urlFor(pa.getClass(), pa.getId()));
                        });
                Optional.ofNullable(currData.getProductAreaId()).map(this::getPa)
                        .ifPresent(pa -> {
                            item.toProductArea(pa.getName());
                            item.toProductAreaUrl(urlGenerator.urlFor(pa.getClass(), pa.getId()));
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
            item.newTeams(convert(newTeams, teamTarget -> new Item(urlGenerator.urlFor(Team.class, teamTarget.getTargetId()), teamNameFor(teamTarget))));
            item.removedTeams(
                    convert(removedTeams,
                            teamTarget -> new Item(urlGenerator.urlFor(Team.class, teamTarget.getTargetId()), teamNameFor(teamTarget), teamTarget.isDelete())));

            ProductArea prevData = prevVersion.getProductAreaData();
            ProductArea currData = currVersion.getProductAreaData();
            item.fromType(Lang.areaType(prevData.getAreaType()));
            item.toType(Lang.areaType(currData.getAreaType()));
        }
        var fromMembers = members(prevVersion);
        var toMembers = members(currVersion);

        item.removedMembers(convertMember(filterCommonElements(fromMembers, toMembers, Member::getNavIdent)));
        item.newMembers(convertMember(filterCommonElements(toMembers, fromMembers, Member::getNavIdent)));

        return item.build();
    }

    private ProductArea getPa(UUID id) {
        try {
            return paCache.get(id);
        } catch (NotFoundException e) {
            log.trace("Product area has been deleted {}", id);
            return null;
        }
    }

    private String teamNameFor(AuditTarget teamTarget) {
        return teamTarget.isCreate() || teamTarget.isUpdate() ? teamTarget.getCurrAuditVersion().getTeamData().getName()
                : teamTarget.getPrevAuditVersion().getTeamData().getName();
    }

    private UUID paIdForTeamAudit(AuditVersion auditVersion) {
        return auditVersion == null ? null : auditVersion.getTeamData().getProductAreaId();
    }

    private List<Item> convertMember(List<? extends Member> list) {
        return convertIdents(convert(list, Member::getNavIdent));
    }

    private List<Item> convertIdents(List<String> list) {
        return convert(list,
                ident -> new Item(
                        urlGenerator.resourceUrl(ident),
                        nomClient.getNameForIdent(ident),
                        false,
                        ident)
        );
    }

    private List<Member> members(AuditVersion version) {
        if (version.isTeam()) {
            return List.copyOf(version.getTeamData().getMembers());
        } else if (version.isProductArea()) {
            return List.copyOf(version.getProductAreaData().getMembers());
        }
        return List.of();
    }

    public NotificationMessage<NudgeModel> nudgeTime(Membered membered, TeamRole role) {
        NudgeModel model = NudgeModel.builder()
                .targetUrl(urlGenerator.urlFor(membered.getClass(), membered.getId()))
                .targetName(membered.getName())
                .targetType(Lang.objectType(membered.getClass()))
                .recipientRole(Lang.roleName(role).toLowerCase())
                .cutoffTime(NotificationConstants.NUDGE_TIME_CUTOFF_DESCRIPTION)
                .build();

        return new NotificationMessage<>("Teamkatalog påminnelse for %s %s".formatted(model.getTargetType(), model.getTargetName()), model, urlGenerator.isDev());
    }

    public NotificationMessage<InactiveModel> inactive(Membered membered, TeamRole role, List<String> identsInactive) {
        InactiveModel model = InactiveModel.builder()
                .targetUrl(urlGenerator.urlFor(membered.getClass(), membered.getId()))
                .targetName(membered.getName())
                .targetType(Lang.objectType(membered.getClass()))
                .recipientRole(Lang.roleName(role).toLowerCase())
                .members(convertIdents(identsInactive))
                .build();
        return new NotificationMessage<>("Medlemmer av %s %s har blitt inaktive".formatted(model.getTargetType(), model.getTargetName()), model, urlGenerator.isDev());
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

    @Data
    public static class NotificationMessage<T> {

        private final String subject;
        private final T model;
        private final boolean empty;
        private final boolean dev;

        NotificationMessage(String subject, T model, boolean dev, boolean isEmpty) {
            this.subject = subject + (dev ? " [DEV]" : "");
            this.model = model;
            this.empty = isEmpty;
            this.dev = dev;
        }

        NotificationMessage(String subject, T model, boolean dev) {
            this(subject, model, dev, false);
        }
    }

}
