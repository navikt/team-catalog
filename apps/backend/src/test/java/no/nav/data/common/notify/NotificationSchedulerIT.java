package no.nav.data.common.notify;

import lombok.SneakyThrows;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.Notification.NotificationType;
import no.nav.data.common.notify.domain.NotificationState;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationSchedulerIT extends IntegrationTestBase {

    @Autowired
    private NotificationScheduler scheduler;

    @Test
    void initAudits() {
        storageService.save(Team.builder()
                .name("team a")
                .build());

        var audits = auditVersionRepository.findAll();
        assertThat(audits).hasSize(1);
        var audit = audits.get(0);

        init();

        var states = storageService.getAll(NotificationState.class);
        assertThat(states).hasSize(4);
        states.forEach(s -> {
            assertThat(s.getLastAuditNotified()).isEqualTo(audit.getId());
        });
    }

    @Test
    void shouldNotCreateTaskIfNoEdits() {
        storageService.save(Notification.builder()
                .ident("S123456")
                .time(NotificationTime.ALL)
                .type(NotificationType.ALL_EVENTS)
                .build());

        storageService.save(Team.builder()
                .name("team a")
                .build());
        init();

        runCreateTasks();
        assertThat(storageService.getAll(NotificationTask.class)).isEmpty();
    }

    @Test
    void shouldCreateTaskCreated() {
        storageService.save(Notification.builder()
                .ident("S123456")
                .time(NotificationTime.ALL)
                .type(NotificationType.ALL_EVENTS)
                .build());

        storageService.save(Team.builder()
                .name("team a")
                .build());
        init();

        var team = storageService.save(Team.builder()
                .name("team b")
                .build());
        storageService.save(team);

        runCreateTasks();
        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(1);
        var task = tasks.get(0);
        assertThat(task.getTargets()).hasSize(1);
        assertThat(task.getIdent()).isEqualTo("S123456");
        assertThat(task.getTime()).isEqualTo(NotificationTime.ALL);

        var audits = auditVersionRepository.findByTableIdOrderByTimeDesc(team.getId().toString());
        assertThat(audits).hasSize(1);
        assertThat(task.getTargets().get(0).getPrevAuditId()).isNull();
        assertThat(task.getTargets().get(0).getCurrAuditId()).isEqualTo(audits.get(0).getId());
    }

    @Test
    void shouldCreateTaskUpdated() {
        storageService.save(Notification.builder()
                .ident("S123456")
                .time(NotificationTime.ALL)
                .type(NotificationType.ALL_EVENTS)
                .build());

        var team = storageService.save(Team.builder()
                .name("team a")
                .build());
        init();
        team.setMembers(List.of(TeamMember.builder()
                .navIdent("S123456")
                .role(TeamRole.PRODUCT_OWNER)
                .build()));
        storageService.save(team);

        runCreateTasks();
        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(1);
        var task = tasks.get(0);
        assertThat(task.getTargets()).hasSize(1);
        assertThat(task.getIdent()).isEqualTo("S123456");
        assertThat(task.getTime()).isEqualTo(NotificationTime.ALL);

        var audits = auditVersionRepository.findByTableIdOrderByTimeDesc(team.getId().toString());
        assertThat(audits).hasSize(2);
        assertThat(task.getTargets().get(0).getPrevAuditId()).isEqualTo(audits.get(1).getId());
        assertThat(task.getTargets().get(0).getCurrAuditId()).isEqualTo(audits.get(0).getId());
    }

    @Test
    void shouldCreateTaskDeleted() {
        storageService.save(Notification.builder()
                .ident("S123456")
                .time(NotificationTime.ALL)
                .type(NotificationType.ALL_EVENTS)
                .build());

        var team = storageService.save(Team.builder()
                .name("team a")
                .build());
        init();
        storageService.delete(team);

        runCreateTasks();
        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(1);
        var task = tasks.get(0);
        assertThat(task.getTargets()).hasSize(1);
        assertThat(task.getIdent()).isEqualTo("S123456");
        assertThat(task.getTime()).isEqualTo(NotificationTime.ALL);

        var audits = auditVersionRepository.findByTableIdOrderByTimeDesc(team.getId().toString());
        assertThat(audits).hasSize(2);
        assertThat(task.getTargets().get(0).getPrevAuditId()).isEqualTo(audits.get(1).getId());
        assertThat(task.getTargets().get(0).getCurrAuditId()).isNull();
    }

    private void runCreateTasks() {
        //fixAuditTimings
        jdbcTemplate.execute("update audit_version set time = time - interval '10 minute';");
        scheduler.summary(NotificationTime.ALL);
    }

    @SneakyThrows
    private void init() {
        scheduler.notifyInit(lockConfiguration -> Optional.of(() -> {
        })).run(new DefaultApplicationArguments());
    }
}