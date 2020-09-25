package no.nav.data.common.notify;

import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.Notification.NotificationType;
import no.nav.data.common.notify.domain.NotificationState;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;

import java.util.List;
import java.util.Optional;

import static no.nav.data.common.utils.StreamUtils.find;
import static org.assertj.core.api.Assertions.assertThat;

class NotificationSchedulerIT extends IntegrationTestBase {

    @Autowired
    private NotificationScheduler scheduler;

    @Test
    void initAudits() throws Exception {
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
    void shouldNotCreateTaskIfNoEdits() throws Exception {
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
    void shouldCreateTaskCreated() throws Exception {
        storageService.save(Notification.builder()
                .ident("S123456")
                .time(NotificationTime.ALL)
                .type(NotificationType.ALL_EVENTS)
                .build());

        var teamA = storageService.save(Team.builder()
                .name("team a")
                .build());

        var pa = storageService.save(ProductArea.builder()
                .name("Pa name")
                .build());

        storageService.save(Notification.builder()
                .ident("S123456")
                .target(teamA.getId())
                .time(NotificationTime.ALL)
                .type(NotificationType.TEAM)
                .build());
        storageService.save(Notification.builder()
                .ident("S123457")
                .target(pa.getId())
                .time(NotificationTime.ALL)
                .type(NotificationType.PA)
                .build());

        var teamB = storageService.save(Team.builder()
                .name("team b")
                .build());
        init();
        teamA.setMembers(List.of(TeamMember.builder()
                .navIdent("S123456")
                .role(TeamRole.PRODUCT_OWNER)
                .build()));
        storageService.save(teamA);
        storageService.delete(teamB);
        pa.setName("New Pa Name");
        storageService.save(pa);

        var teamC = storageService.save(Team.builder()
                .name("team c")
                .productAreaId(pa.getId())
                .build());

        runCreateTasks();

        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(2);
        var allTask = find(tasks, t -> t.getIdent().equals("S123456"));
        var paTask = find(tasks, t -> t.getIdent().equals("S123457"));
        assertAllTargets(teamA, teamB, teamC, pa, allTask);
        assertProductAreaTargets(teamC, pa, paTask);
    }

    private void assertProductAreaTargets(Team teamC, ProductArea pa, NotificationTask task) {
        // teamC
        var teamCAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamC.getId().toString());
        assertThat(teamCAudits).hasSize(1);
        var teamCTarget = find(task.getTargets(), t -> t.getTargetId().equals(teamC.getId()));
        assertThat(teamCTarget.getPrevAuditId()).isNull();
        assertThat(teamCTarget.getCurrAuditId()).isEqualTo(teamCAudits.get(0).getId());

        // Pa
        var paAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(pa.getId().toString());
        assertThat(paAudits).hasSize(2);
        var paTarget = find(task.getTargets(), t -> t.getTargetId().equals(pa.getId()));
        assertThat(paTarget.getPrevAuditId()).isEqualTo(paAudits.get(1).getId());
        assertThat(paTarget.getCurrAuditId()).isEqualTo(paAudits.get(0).getId());
    }

    private void assertAllTargets(Team teamA, Team teamB, Team teamC, ProductArea pa, NotificationTask task) {
        assertThat(task.getTargets()).hasSize(4);
        assertThat(task.getIdent()).isEqualTo("S123456");
        assertThat(task.getTime()).isEqualTo(NotificationTime.ALL);

        // teamA
        var teamAAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamA.getId().toString());
        assertThat(teamAAudits).hasSize(2);
        var teamATarget = find(task.getTargets(), t -> t.getTargetId().equals(teamA.getId()));
        assertThat(teamATarget.getPrevAuditId()).isEqualTo(teamAAudits.get(1).getId());
        assertThat(teamATarget.getCurrAuditId()).isEqualTo(teamAAudits.get(0).getId());

        // teamB
        var teamBAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamB.getId().toString());
        assertThat(teamBAudits).hasSize(2);
        var teamBTarget = find(task.getTargets(), t -> t.getTargetId().equals(teamB.getId()));
        assertThat(teamBTarget.getPrevAuditId()).isEqualTo(teamBAudits.get(1).getId());
        assertThat(teamBTarget.getCurrAuditId()).isNull();

        // teamC
        var teamCAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamC.getId().toString());
        assertThat(teamCAudits).hasSize(1);
        var teamCTarget = find(task.getTargets(), t -> t.getTargetId().equals(teamC.getId()));
        assertThat(teamCTarget.getPrevAuditId()).isNull();
        assertThat(teamCTarget.getCurrAuditId()).isEqualTo(teamCAudits.get(0).getId());

        // Pa
        var paAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(pa.getId().toString());
        assertThat(paAudits).hasSize(2);
        var paTarget = find(task.getTargets(), t -> t.getTargetId().equals(pa.getId()));
        assertThat(paTarget.getPrevAuditId()).isEqualTo(paAudits.get(1).getId());
        assertThat(paTarget.getCurrAuditId()).isEqualTo(paAudits.get(0).getId());
    }

    private void runCreateTasks() {
        //fixAuditTimings
        jdbcTemplate.execute("update audit_version set time = time - interval '10 minute';");
        scheduler.summary(NotificationTime.ALL);
    }

    private void init() throws Exception {
        scheduler.notifyInit(lockConfiguration -> Optional.of(() -> {
        })).run(new DefaultApplicationArguments());
    }
}