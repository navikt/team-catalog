package no.nav.data.common.notify;

import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.DefaultLockingTaskExecutor;
import net.javacrumbs.shedlock.core.LockConfiguration;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.dto.AuditMetadata;
import no.nav.data.common.notify.domain.AuditMetadataPa;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.Notification.NotificationType;
import no.nav.data.common.notify.domain.NotificationRepository;
import no.nav.data.common.notify.domain.NotificationState;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.Team;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.tryFind;
import static no.nav.data.common.utils.StreamUtils.union;
import static org.docx4j.com.google.common.math.IntMath.pow;
import static org.springframework.util.CollectionUtils.isEmpty;

@Slf4j
@Component
public class NotificationScheduler {


    private LocalDateTime snooze = null;
    private int snoozeTimes = 0;

    private final NotificationRepository repository;
    private final NotificationService service;
    private final AuditVersionRepository auditVersionRepository;
    private final StorageService storage;

    public NotificationScheduler(NotificationRepository repository, NotificationService service, AuditVersionRepository auditVersionRepository,
            StorageService storage) {
        this.repository = repository;
        this.service = service;
        this.auditVersionRepository = auditVersionRepository;
        this.storage = storage;
    }

    @Bean
    public ApplicationRunner notifyInit(LockProvider lockProvider) {
        return args -> {
            LockConfiguration config = new LockConfiguration(Instant.now(), "notifyInit", Duration.ofMinutes(1), Duration.ofMinutes(1));
            new DefaultLockingTaskExecutor(lockProvider).executeWithLock((Runnable) this::doInit, config);
        };
    }

    void doInit() {
        // As we will not send notifications if no notifications have been sent yet, initialize them
        var pageable = new PageParameters(0, 1).createSortedPageByFieldDescending(AuditVersion.Fields.time);
        var audits = auditVersionRepository.findAll(pageable);
        var lastAudit = audits.getTotalElements() > 0 ? audits.getContent().get(0).getId() : null;

        for (NotificationTime time : NotificationTime.values()) {
            var state = getState(time);
            if (state.getLastAuditNotified() == null && lastAudit != null) {
                state.setLastAuditNotified(lastAudit);
                state = storage.save(state);
                log.info("initialized state {}", state);
            }
        }
    }

    //    @Scheduled(cron = "0 0 10 * * TUE")
//    @SchedulerLock(name = "nudge")
    public void nudge() {
        List<Team> teams = storage.getAll(Team.class);
        List<ProductArea> productAreas = storage.getAll(ProductArea.class);

        teams.forEach(this::timeBasedNudge);
        productAreas.forEach(this::timeBasedNudge);
    }

    /**
     * Nudge teams and product areas that have not been updated in a while
     */
    private <T extends Membered> void timeBasedNudge(T object) {
        var cutoff = LocalDateTime.now().minus(NotificationConstants.NUDGE_TIME_CUTOFF);
        var lastModified = object.getChangeStamp().getLastModifiedDate();
        var lastNudge = Optional.ofNullable(object.getLastNudge()).orElse(lastModified);
        if (lastModified.isBefore(cutoff) && lastNudge.isBefore(cutoff)) {
            service.nudge(object);
            repository.updateNudge(object.getId());
        }
    }

    @Scheduled(cron = "0 * * * * ?")
    @SchedulerLock(name = "runNotifyTasks")
    public void runNotifyTasks() {
        Duration uptime = DateUtil.uptime();
        if (uptime.minus(Duration.ofMinutes(2)).isNegative()) {
            log.info("NotifyTasks - skip uptime {}", uptime);
            return;
        }

        if (snooze != null && snooze.isAfter(LocalDateTime.now())) {
            return;
        }
        snooze = null;
        int maxErrors = 5;

        var tasks = storage.getAll(NotificationTask.class);
        log.info("NotifyTasks - running {} tasks", tasks.size());
        var errors = 0;
        for (var task : tasks) {
            if (errors >= maxErrors) {
                snoozeTimes = Math.max(snoozeTimes + 1, 5);
                snooze = LocalDateTime.now().plusMinutes(3L + pow(4, snoozeTimes));
                return;
            }

            try {
                service.notifyTask(task);
                storage.delete(task);

                snoozeTimes = 0;
            } catch (Exception e) {
                errors++;
                log.error("Failed to notify", e);
            }
        }
    }

    @Scheduled(cron = "30 * * * * ?")
    @SchedulerLock(name = "allNotify")
    public void allNotify() {
        var uptime = DateUtil.uptime();
        if (uptime.minus(Duration.ofMinutes(2)).isNegative()) {
            log.info("ALL - Notification skip uptime {}", uptime);
            return;
        }
        summary(NotificationTime.ALL);
    }

    @Scheduled(cron = "0 0 9 * * ?")
    @SchedulerLock(name = "dailyNotify")
    public void dailyNotify() {
        summary(NotificationTime.DAILY);
    }

    @Scheduled(cron = "0 0 10 * * MON")
    @SchedulerLock(name = "weeklyNotify")
    public void weeklyNotify() {
        summary(NotificationTime.WEEKLY);
    }

    @Scheduled(cron = "0 0 11 1 * ?")
    @SchedulerLock(name = "monthlyNotify")
    public void monthlyNotify() {
        summary(NotificationTime.MONTHLY);
    }

    void summary(NotificationTime time) {
        log.info("{} - Notification running", time);
        var state = getState(time);
        UUID lastAuditId = null;

        if (state.getLastAuditNotified() != null) {
            var audits = union(
                    auditVersionRepository.getAllMetadataAfter(state.getLastAuditNotified()),
                    isEmpty(state.getSkipped()) ? List.of() : auditVersionRepository.getMetadataByIds(state.getSkipped())
            );
            audits.sort(Comparator.comparing(AuditMetadata::getTime));

            if (time == NotificationTime.ALL) {
                // Skip objects that have been edited very recently
                LocalDateTime cutoff = LocalDateTime.now().minusMinutes(3);
                var recents = filter(audits, a -> a.getTime().isAfter(cutoff)).stream().map(AuditMetadata::getTableId).distinct().collect(toList());
                var removed = filter(audits, a -> recents.contains(a.getTableId()));
                audits.removeIf(removed::contains);
                log.info("Skipping {}", new ArrayList<>(removed));
                state.setSkipped(convert(removed, AuditMetadata::getTableId));
            }

            if (audits.isEmpty()) {
                log.info("{} - Notification end - no new audits", time);
                return;
            }
            var lastAudit = audits.get(audits.size() - 1);
            lastAuditId = lastAudit.getId();
            var auditsStart = audits.get(0).getTime().minusSeconds(1);
            var auditsEnd = lastAudit.getTime().plusSeconds(1);
            log.info("{} - Notification {} audits", time, audits.size());

            var notifications = GenericStorage.to(repository.findByTime(time), Notification.class);
            notifications = expandProductAreaNotifications(notifications, auditsStart, auditsEnd);
            var auditsByTargetId = audits.stream().collect(groupingBy(AuditMetadata::getTableId));
            notifications.removeIf(n -> {
                        boolean notAllEventNotification = n.getType() != NotificationType.ALL_EVENTS;
                        boolean noAuditsForNotification = !auditsByTargetId.containsKey(n.getTarget());
                        boolean noDependentAuditsForNotification = auditsByTargetId.keySet().stream().noneMatch(n::isDependentOn);
                        log.info("Notification target {} removed - notAllEventNotification {} noAuditsForNotification {} noDependentAuditsForNotification {}",
                                n.getTarget(), notAllEventNotification, noAuditsForNotification, noDependentAuditsForNotification);
                        return notAllEventNotification && noAuditsForNotification && noDependentAuditsForNotification;
                    }
            );
            notifications.forEach(n -> {
                if (n.getTarget() != null && !auditsByTargetId.containsKey(n.getTarget())) {
                    log.info("Adding empty audits for target {}", n.getTarget());
                    auditsByTargetId.put(n.getTarget(), List.of());
                }
            });

            var notificationsByIdent = notifications.stream().collect(groupingBy(Notification::getIdent));
            log.info("{} - Notification for {}", time, notificationsByIdent.keySet());
            notificationsByIdent.forEach((key, value) -> createTasks(key, value, auditsByTargetId));
        }

        state.setLastAuditNotified(lastAuditId);
        storage.save(state);
        log.info("{} - Notification end at {}", time, lastAuditId);
    }

    private List<Notification> expandProductAreaNotifications(List<Notification> notifications, LocalDateTime auditsStart, LocalDateTime auditsEnd) {
        var allNotifications = new ArrayList<>(notifications);
        for (Notification notification : notifications) {
            if (notification.getType() == NotificationType.PA) {
                var teamsPrev = auditVersionRepository.getPrevMetadataForTeamsByProductArea(notification.getTarget(), auditsStart, auditsEnd);
                var teamsCurr = auditVersionRepository.getCurrMetadataForTeamsByProductArea(notification.getTarget(), auditsStart, auditsEnd);
                log.info("Notification PA {} teamsPrev {}", notification.getTarget(), new ArrayList<>(teamsPrev));
                log.info("Notification PA {} teamsCurr {}", notification.getTarget(), new ArrayList<>(teamsCurr));
                var allTeams = union(teamsPrev, teamsCurr).stream().map(AuditMetadataPa::getTableId).distinct().collect(toList());
                allNotifications.addAll(convert(allTeams, teamId -> Notification.builder()
                        .type(NotificationType.TEAM)
                        .time(notification.getTime())
                        .ident(notification.getIdent())
                        .target(teamId)
                        .build()));
                notification.setDependentTargets(allTeams);
                log.info("Notification PA {} DependentTargets {}", notification.getTarget(), allTeams);
            }
        }
        return StreamUtils.distinctByKey(allNotifications, n -> n.getTarget() + n.getIdent());
    }

    private void createTasks(String ident, List<Notification> notifications, Map<UUID, List<AuditMetadata>> auditsByTargetId) {
        NotificationTargetsAudits auditsForIdent = tryFind(notifications, n1 -> n1.getType() == NotificationType.ALL_EVENTS)
                // get all audits in one if there is an all event notification
                .map(notification -> new NotificationTargetsAudits(ident, List.of(new NotificationTargetAudits(notification, auditsByTargetId))))
                // or get audits by target
                .orElseGet(() -> new NotificationTargetsAudits(ident,
                        convert(notifications, n -> new NotificationTargetAudits(n, Map.of(n.getTarget(), auditsByTargetId.get(n.getTarget()))))));
        createTask(auditsForIdent);
    }

    private void createTask(NotificationTargetsAudits auditsForIdent) {
        var allTargets = new HashMap<UUID, List<AuditMetadata>>();
        auditsForIdent.targetAudits().forEach(ta -> allTargets.putAll(ta.audits));
        var ident = auditsForIdent.ident;
        storage.save(
                NotificationTask.builder()
                        .ident(ident)
                        .time(auditsForIdent.targetAudits.get(0).notification().getTime())
                        .targets(convert(allTargets.entrySet(), targetGrouping -> {
                            var targetId = targetGrouping.getKey();
                            var audits = targetGrouping.getValue();
                            AuditMetadata oldestAudit;
                            UUID prev;
                            UUID curr;
                            if (audits.isEmpty()) {
                                // If the target in question has not actually changed, ie. a team added/removed in a product area
                                oldestAudit = auditVersionRepository.lastAuditForObject(targetId);
                                prev = oldestAudit.getId();
                                curr = oldestAudit.getId();
                            } else {
                                oldestAudit = audits.get(0);
                                var newestAudit = audits.get(audits.size() - 1);
                                prev = getPreviousFor(oldestAudit);
                                curr = newestAudit.getAction() == Action.DELETE ? null : newestAudit.getId();
                            }
                            var tableName = oldestAudit.getTableName();
                            log.info("Notification to {} target {}: {} from {} to {}", ident, tableName, targetId, prev, curr);
                            return AuditTarget.builder()
                                    .targetId(targetId)
                                    .type(tableName)
                                    .prevAuditId(prev)
                                    .currAuditId(curr)
                                    .build();
                        }))
                        .build()
        );
    }

    private UUID getPreviousFor(AuditMetadata oldestAudit) {
        if (oldestAudit.getAction() == Action.CREATE) {
            return null;
        }
        return UUID.fromString(auditVersionRepository.getPreviousAuditIdFor(oldestAudit.getId()));
    }


    private NotificationState getState(NotificationTime time) {
        return storage.getAll(NotificationState.class).stream()
                .filter(n -> n.getTime() == time).findFirst()
                .orElse(NotificationState.builder().time(time).build());
    }

    record NotificationTargetsAudits(String ident, List<NotificationTargetAudits> targetAudits) {

    }

    record NotificationTargetAudits(Notification notification, Map<UUID, List<AuditMetadata>> audits) {

    }
}
