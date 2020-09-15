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
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.Notification.NotificationType;
import no.nav.data.common.notify.domain.NotificationRepository;
import no.nav.data.common.notify.domain.NotificationState;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.NotificationTarget;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.DateUtil;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.tryFind;
import static org.docx4j.com.google.common.math.IntMath.pow;

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
        UUID lastAudit = null;

        if (state.getLastAuditNotified() != null) {
            var audits = auditVersionRepository.summaryFor(state.getLastAuditNotified());

            if (audits.isEmpty()) {
                log.info("{} - Notification end - no new audits", time);
                return;
            }
            lastAudit = audits.get(audits.size() - 1).auditId();
            log.info("{} - Notification {} audits", time, audits.size());

            var notifications = GenericStorage.to(repository.findByTime(time), Notification.class);
            var auditsById = audits.stream().collect(groupingBy(auditMetadata -> UUID.fromString(auditMetadata.getTableId())));

            var notificationsByIdent = notifications.stream()
                    .collect(groupingBy(Notification::getIdent,
                            mapping(n -> new NotificationTargetHolder(n, n.getType() == NotificationType.ALL_EVENTS ? audits : auditsById.get(n.getTarget())), toList())));
            log.info("{} - Notification for {}", time, notificationsByIdent.keySet());
            log.info("{} - Notification for {}", time, notificationsByIdent);
            notificationsByIdent.forEach(this::notifyFor);
        }

        state.setLastAuditNotified(lastAudit);
        storage.save(state);
        log.info("{} - Notification end at {}", time, lastAudit);
    }


    private void notifyFor(String ident, List<NotificationTargetHolder> targets) {
        var allTargets = tryFind(targets, n -> n.notification.getType() == NotificationType.ALL_EVENTS);
        if (allTargets.isPresent()) {
            targets = List.of(allTargets.get());
        }
        storage.save(
                NotificationTask.builder()
                        .ident(ident)
                        .time(targets.get(0).notification().getTime())
                        .targets(convert(targets, target -> {
                            var audits = target.audits();
                            var oldestAudit = audits.get(0);
                            var newestAudit = audits.get(audits.size() - 1);
                            var prev = getPreviousFor(oldestAudit);
                            var curr = newestAudit.getAction() == Action.DELETE ? null : newestAudit.auditId();

                            log.info("Notification to {} target {}: {} from {} to {}", ident, oldestAudit.getTableName(), oldestAudit.getTableId(), prev, curr);
                            return NotificationTarget.builder()
                                    .notificationId(target.notification().getId())
                                    .type(oldestAudit.getTableName())
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
        return UUID.fromString(auditVersionRepository.getPreviousAuditIdFor(oldestAudit.auditId()));
    }


    private NotificationState getState(NotificationTime time) {
        return storage.getAll(NotificationState.class).stream()
                .filter(n -> n.getTime() == time).findFirst()
                .orElse(NotificationState.builder().time(time).build());
    }

    record NotificationTargetHolder(Notification notification, List<AuditMetadata> audits) {

    }
}
