package no.nav.data.common.notify;

import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.DefaultLockingTaskExecutor;
import net.javacrumbs.shedlock.core.LockConfiguration;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.dto.AuditMetadata;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationChannel;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.Notification.NotificationType;
import no.nav.data.common.notify.domain.NotificationRepository;
import no.nav.data.common.notify.domain.NotificationState;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.common.notify.domain.TeamAuditMetadata;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.DateUtil;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.find;
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
                if (!removed.isEmpty()) {
                    log.info("Skipping {}", toString(removed));
                }
                state.setSkipped(convert(removed, AuditMetadata::getTableId));
            }

            if (audits.isEmpty()) {
                log.info("{} - Notification end - no new audits", time);
                return;
            }
            var notifications = GenericStorage.to(repository.findByTime(time), Notification.class);

            var lastAudit = audits.get(audits.size() - 1);
            lastAuditId = lastAudit.getId();
            var auditsStart = audits.get(0).getTime();
            var auditsEnd = lastAudit.getTime();
            log.info("{} - Notification {} audits", time, audits.size());

            var teamsPrev = auditVersionRepository.getTeamMetadataBefore(auditsStart);
            var teamsCurr = auditVersionRepository.getTeamMetadataBetween(auditsStart, auditsEnd);
            notifications = expandProductAreaNotifications(notifications, teamsPrev, teamsCurr);
            var auditsByTargetId = audits.stream().collect(groupingBy(AuditMetadata::getTableId));
            notifications.removeIf(n -> {
                        boolean notAllEventNotification = n.getType() != NotificationType.ALL_EVENTS;
                        boolean noAuditsForNotification = !auditsByTargetId.containsKey(n.getTarget());
                        boolean noDependentAuditsForNotification = auditsByTargetId.keySet().stream().noneMatch(n::isDependentOn);
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
            for (Entry<String, List<Notification>> entry : notificationsByIdent.entrySet()) {
                String ident = entry.getKey();
                List<Notification> notificationsForIdent = entry.getValue();
                var notificationTargetAudits = unpackAndGroupTargets(notificationsForIdent, auditsByTargetId);
                var tasksForIdent = createTasks(ident, notificationTargetAudits);
                tasksForIdent.forEach(storage::save);
            }
        }

        state.setLastAuditNotified(lastAuditId);
        storage.save(state);
        log.info("{} - Notification end at {}", time, lastAuditId);
    }

    private List<Notification> expandProductAreaNotifications(List<Notification> notifications, List<TeamAuditMetadata> teamsPrev, List<TeamAuditMetadata> teamsCurr) {
        var allNotifications = new ArrayList<>(notifications);
        for (Notification notification : notifications) {
            if (notification.getType() == NotificationType.PA) {
                var paTeamsPrev = filter(teamsPrev, t -> notification.getTarget().equals(t.getProductAreaId()));
                var paTeamsCurr = filter(teamsCurr, t -> notification.getTarget().equals(t.getProductAreaId()));
                var allTeams = union(paTeamsPrev, paTeamsCurr).stream().map(TeamAuditMetadata::getTableId).distinct().collect(toList());
                // Adding teams from product area to notifications, setting their level as Product area, to enforce correct channel overrides later
                allNotifications.addAll(convert(allTeams, teamId -> Notification.builder()
                        .type(NotificationType.PA)
                        .time(notification.getTime())
                        .ident(notification.getIdent())
                        .channels(notification.getChannels())
                        .target(teamId)
                        .build()));
                notification.setDependentTargets(allTeams);
                log.info("Notification PA {} DependentTargets {}", notification.getTarget(), allTeams);
            }
        }
        return allNotifications;
    }

    private List<NotificationTargetAudits> unpackAndGroupTargets(List<Notification> notifications, Map<UUID, List<AuditMetadata>> auditsByTargetId) {
        var allEventAudits = new ArrayList<NotificationTargetAudits>();
        // unpack ALL_EVENTS
        tryFind(notifications, n -> n.getType() == NotificationType.ALL_EVENTS)
                .ifPresent(n -> allEventAudits.addAll(convert(auditsByTargetId.entrySet(), e -> new NotificationTargetAudits(n, e.getKey(), e.getValue()))));

        var targetAudits = notifications.stream()
                .filter(n -> n.getType() != NotificationType.ALL_EVENTS)
                .map(n -> new NotificationTargetAudits(n, n.getTarget(), auditsByTargetId.get(n.getTarget())))
                .collect(toList());
        return union(allEventAudits, targetAudits);
    }

    private List<NotificationTask> createTasks(String ident, List<NotificationTargetAudits> targetAudits) {
        // All times are equal down here
        var time = targetAudits.get(0).getNotification().getTime();

        // Calculate which type is the most specific for each target.
        // ie. if a a user has a team marked as a different channel than it's product area, we will use the teams channel settings for that target, same goes for ALL_EVENTS.
        Map<UUID, NotificationType> targetTypes = new HashMap<>();
        targetAudits.forEach(ta -> targetTypes.compute(ta.getTargetId(), (uuid, existingType) -> NotificationType.min(ta.getNotification().getType(), existingType)));

        var classifications = Stream.of(NotificationChannel.values()).map(TargetClassification::new).collect(toList());

        targetAudits.forEach(ta -> {
            Notification notification = ta.getNotification();
            UUID targetId = ta.getTargetId();

            var notificationTypeForTarget = targetTypes.get(targetId);
            var silent = notificationTypeForTarget != notification.getType();

            filter(classifications, c -> c.matches(notification.getChannels()))
                    .forEach(c -> c.add(new Target(targetId, ta.getAudits(), silent)));
        });

        return classifications.stream()
                .filter(c -> c.getTargets().stream().anyMatch(t -> !t.isSilent()))
                .map(classification ->
                        NotificationTask.builder()
                                .ident(ident)
                                .time(time)
                                .channel(classification.getChannel())
                                .targets(convertAuditTargets(ident, classification.getTargets()))
                                .build()
                )
                .collect(toList());
    }

    private List<AuditTarget> convertAuditTargets(String ident, List<Target> targets) {
        return convert(targets, target -> {
            var targetId = target.getTarget();
            var audits = target.getAudits();
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
                    .silent(target.isSilent())
                    .build();
        });
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

    private String toString(List<? extends AuditMetadata> auditMetadatas) {
        return convert(auditMetadatas, a ->
                "{tableName=" + a.getTableName() +
                        " tableId=" + a.getTableId() +
                        (a instanceof TeamAuditMetadata amp ? "paId=" + amp.getProductAreaId() + "}" : "}")
        ).toString();
    }

    @Value
    static class NotificationTargetAudits {

        Notification notification;
        UUID targetId;
        List<AuditMetadata> audits;
    }

    @Value
    static class TargetClassification {

        NotificationChannel channel;
        List<Target> targets = new ArrayList<>();
        Set<UUID> targetsAdded = new HashSet<>();

        TargetClassification(NotificationChannel channel) {
            this.channel = channel;
        }

        boolean isAdded(UUID targetId) {
            return targetsAdded.contains(targetId);
        }

        void add(Target target) {
            if (isAdded(target.getTarget())) {
                if (!target.isSilent()) {
                    var existingTarget = find(targets, t -> t.getTarget().equals(target.getTarget()));
                    if (existingTarget.isSilent()) {
                        targets.remove(existingTarget);
                        targets.add(target);
                    }
                }
            } else {
                targetsAdded.add(target.getTarget());
                targets.add(target);
            }
        }

        boolean matches(List<NotificationChannel> channels) {
            return channels.contains(channel);
        }
    }

    @Value
    static class Target {

        UUID target;
        List<AuditMetadata> audits;
        boolean silent;
    }

}
