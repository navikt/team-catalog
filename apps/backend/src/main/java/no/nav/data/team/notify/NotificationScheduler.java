package no.nav.data.team.notify;

import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.DefaultLockingTaskExecutor;
import net.javacrumbs.shedlock.core.LockConfiguration;
import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.auditing.dto.AuditMetadata;
import no.nav.data.common.rest.PageParameters;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.notify.domain.Notification;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.domain.NotificationRepository;
import no.nav.data.team.notify.domain.NotificationState;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.notify.domain.TeamAuditMetadata;
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
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
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
    private final AuditDiffService auditDiffService;

    public NotificationScheduler(NotificationRepository repository, NotificationService service, AuditVersionRepository auditVersionRepository,
            StorageService storage, AuditDiffService auditDiffService) {
        this.repository = repository;
        this.service = service;
        this.auditVersionRepository = auditVersionRepository;
        this.storage = storage;
        this.auditDiffService = auditDiffService;
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
    @Scheduled(cron = "0 0 * * * *")
    @SchedulerLock(name = "nudgeTime")
    public void nudgeTime() {
        storage.getAll(Team.class).forEach(this::timeBasedNudge);
        storage.getAll(ProductArea.class).forEach(this::timeBasedNudge);
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

            var tasksForIdent = auditDiffService.createTask(audits, notifications);
            tasksForIdent.forEach(storage::save);
        }

        state.setLastAuditNotified(lastAuditId);
        storage.save(state);
        log.info("{} - Notification end at {}", time, lastAuditId);
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


}
