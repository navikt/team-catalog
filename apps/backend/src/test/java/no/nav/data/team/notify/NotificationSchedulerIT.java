package no.nav.data.team.notify;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.notify.domain.Notification;
import no.nav.data.team.notify.domain.Notification.NotificationChannel;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.domain.Notification.NotificationType;
import no.nav.data.team.notify.domain.NotificationState;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import org.assertj.core.data.TemporalUnitLessThanOffset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        allNotifications("S123456");

        storageService.save(Team.builder()
                .name("team a")
                .build());
        init();

        runCreateTasks();
        assertThat(storageService.getAll(NotificationTask.class)).isEmpty();
    }

    @Test
    void shouldCreateTask() throws Exception {
        var teamA = storageService.save(Team.builder()
                .name("team a")
                .build());

        var pa = storageService.save(ProductArea.builder()
                .name("Pa name")
                .build());

        teamNotification(teamA.getId(), "S123456");
        paNotification(pa.getId(), "S123457");
        allNotifications("S123456");

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
        assertThat(tasks).hasSize(3);
        var allTaskEmail = find(tasks, t -> t.getIdent().equals("S123456") && t.getChannel() == NotificationChannel.EMAIL);
        var allTaskSlack = find(tasks, t -> t.getIdent().equals("S123456") && t.getChannel() == NotificationChannel.SLACK);
        var paTask = find(tasks, t -> t.getIdent().equals("S123457"));
        assertAllTargetsSlack(teamA, teamB, teamC, pa, allTaskSlack);
        assertAllTargetsEmail(teamA, teamB, teamC, pa, allTaskEmail);
        assertProductAreaTargets(teamC, pa, paTask);
    }

    private void assertProductAreaTargets(Team teamC, ProductArea pa, NotificationTask task) {
        assertThat(task.getChannel()).isEqualTo(NotificationChannel.SLACK);
        assertThat(task.getTargets()).hasSize(2);
        assertThat(task.getIdent()).isEqualTo("S123457");
        assertThat(task.getTime()).isEqualTo(NotificationTime.ALL);

        // teamC
        var teamCAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamC.getId().toString());
        assertThat(teamCAudits).hasSize(1);
        var teamCTarget = find(task.getTargets(), t -> t.getTargetId().equals(teamC.getId()));
        assertThat(teamCTarget.isSilent()).isFalse();
        assertThat(teamCTarget.getPrevAuditId()).isNull();
        assertThat(teamCTarget.getCurrAuditId()).isEqualTo(teamCAudits.get(0).getId());

        // Pa
        var paAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(pa.getId().toString());
        assertThat(paAudits).hasSize(2);
        var paTarget = find(task.getTargets(), t -> t.getTargetId().equals(pa.getId()));
        assertThat(paTarget.isSilent()).isFalse();
        assertThat(paTarget.getPrevAuditId()).isEqualTo(paAudits.get(1).getId());
        assertThat(paTarget.getCurrAuditId()).isEqualTo(paAudits.get(0).getId());
    }

    private void assertAllTargetsEmail(Team teamA, Team teamB, Team teamC, ProductArea pa, NotificationTask task) {
        assertThat(task.getTargets()).hasSize(1);
        assertThat(task.getChannel()).isEqualTo(NotificationChannel.EMAIL);
        assertThat(task.getIdent()).isEqualTo("S123456");
        assertThat(task.getTime()).isEqualTo(NotificationTime.ALL);

        assertThat(find(task.getTargets(), t -> t.getTargetId().equals(teamA.getId())).isSilent()).isFalse();
    }

    private void assertAllTargetsSlack(Team teamA, Team teamB, Team teamC, ProductArea pa, NotificationTask task) {
        assertThat(task.getTargets()).hasSize(4);
        assertThat(task.getChannel()).isEqualTo(NotificationChannel.SLACK);
        assertThat(task.getIdent()).isEqualTo("S123456");
        assertThat(task.getTime()).isEqualTo(NotificationTime.ALL);

        // teamA
        var teamAAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamA.getId().toString());
        assertThat(teamAAudits).hasSize(2);
        var teamATarget = find(task.getTargets(), t -> t.getTargetId().equals(teamA.getId()));
        assertThat(teamATarget.isSilent()).isTrue();
        assertThat(teamATarget.getPrevAuditId()).isEqualTo(teamAAudits.get(1).getId());
        assertThat(teamATarget.getCurrAuditId()).isEqualTo(teamAAudits.get(0).getId());

        // teamB
        var teamBAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamB.getId().toString());
        assertThat(teamBAudits).hasSize(2);
        var teamBTarget = find(task.getTargets(), t -> t.getTargetId().equals(teamB.getId()));
        assertThat(teamBTarget.isSilent()).isFalse();
        assertThat(teamBTarget.getPrevAuditId()).isEqualTo(teamBAudits.get(1).getId());
        assertThat(teamBTarget.getCurrAuditId()).isNull();

        // teamC
        var teamCAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(teamC.getId().toString());
        assertThat(teamCAudits).hasSize(1);
        var teamCTarget = find(task.getTargets(), t -> t.getTargetId().equals(teamC.getId()));
        assertThat(teamCTarget.isSilent()).isFalse();
        assertThat(teamCTarget.getPrevAuditId()).isNull();
        assertThat(teamCTarget.getCurrAuditId()).isEqualTo(teamCAudits.get(0).getId());

        // Pa
        var paAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(pa.getId().toString());
        assertThat(paAudits).hasSize(2);
        var paTarget = find(task.getTargets(), t -> t.getTargetId().equals(pa.getId()));
        assertThat(paTarget.isSilent()).isFalse();
        assertThat(paTarget.getPrevAuditId()).isEqualTo(paAudits.get(1).getId());
        assertThat(paTarget.getCurrAuditId()).isEqualTo(paAudits.get(0).getId());
    }

    @Test
    void createAndDeleteTarget() throws Exception {
        allNotifications("S123456");
        storageService.save(Team.builder().name("team b").build());
        init();

        var teamA = storageService.save(Team.builder()
                .name("team a")
                .build());

        storageService.save(teamA);
        storageService.delete(teamA);

        runCreateTasks();

        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).isEmpty();
    }

    @Test
    void teamRemovedFromPa() throws Exception {
        var pa = storageService.save(ProductArea.builder()
                .name("Pa name")
                .build());
        var teamA = storageService.save(Team.builder()
                .name("team a")
                .productAreaId(pa.getId())
                .build());
        storageService.save(Team.builder()
                .name("team b")
                .build());

        allNotifications("S123456");
        paNotification(pa.getId(), "S123457");
        init();

        teamA.setProductAreaId(null);
        storageService.save(teamA);

        runCreateTasks();

        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(2);

        var allTask = find(tasks, t -> t.getIdent().equals("S123456"));
        var paTask = find(tasks, t -> t.getIdent().equals("S123457"));
        assertPaTaskRemove(allTask, pa, teamA);
        assertPaTaskRemove(paTask, pa, teamA);
    }

    private void assertPaTaskRemove(NotificationTask task, ProductArea pa, Team teamA) {
        assertThat(task.getTargets()).hasSize(2);
        var paTarget = find(task.getTargets(), t -> t.getTargetId().equals(pa.getId()));
        var paAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(pa.getId().toString());
        assertThat(paAudits).hasSize(1);
        assertThat(paTarget.getCurrAuditId()).isNotNull().isEqualTo(paTarget.getPrevAuditId()).isEqualTo(paAudits.get(0).getId());
    }

    @Test
    void teamDeletedFromPa() throws Exception {
        var pa = storageService.save(ProductArea.builder()
                .name("Pa name")
                .build());
        var teamA = storageService.save(Team.builder()
                .name("team a")
                .productAreaId(pa.getId())
                .build());
        storageService.save(Team.builder()
                .name("team b")
                .build());

        allNotifications("S123456");
        paNotification(pa.getId(), "S123457");
        init();

        storageService.delete(teamA);

        runCreateTasks();

        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(2);

        var allTask = find(tasks, t -> t.getIdent().equals("S123456"));
        var paTask = find(tasks, t -> t.getIdent().equals("S123457"));
        assertPaTaskRemove(allTask, pa, teamA);
        assertPaTaskRemove(paTask, pa, teamA);
    }

    @Test
    void teamAddedToPa() throws Exception {
        var pa = storageService.save(ProductArea.builder()
                .name("Pa name")
                .build());
        var teamA = storageService.save(Team.builder()
                .name("team a")
                .build());
        storageService.save(Team.builder()
                .name("team b")
                .build());

        allNotifications("S123456");
        paNotification(pa.getId(), "S123457");
        init();

        teamA.setProductAreaId(pa.getId());
        storageService.save(teamA);

        runCreateTasks();

        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(2);

        var allTask = find(tasks, t -> t.getIdent().equals("S123456"));
        var paTask = find(tasks, t -> t.getIdent().equals("S123457"));
        assertPaTaskAdd(allTask, pa, teamA);
        assertPaTaskAdd(paTask, pa, teamA);
    }

    private void assertPaTaskAdd(NotificationTask task, ProductArea pa, Team teamA) {
        assertThat(task.getTargets()).hasSize(2);
        var paTarget = find(task.getTargets(), t -> t.getTargetId().equals(pa.getId()));
        var paAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(pa.getId().toString());
        assertThat(paAudits).hasSize(1);
        assertThat(paTarget.getCurrAuditId()).isNotNull().isEqualTo(paTarget.getPrevAuditId()).isEqualTo(paAudits.get(0).getId());
    }

    @Test
    void moveTeamBetweenTwoWatchedPas() throws Exception {
        var paFrom = storageService.save(ProductArea.builder()
                .name("Pa from")
                .build());
        var paTo = storageService.save(ProductArea.builder()
                .name("Pa to")
                .build());
        var team = storageService.save(Team.builder()
                .name("team")
                .productAreaId(paFrom.getId())
                .build());

        // removed from PA before diff window
        var teamShouldNotBeIncluded = storageService.save(Team.builder()
                .name("team")
                .productAreaId(paFrom.getId())
                .build());
        teamShouldNotBeIncluded.setProductAreaId(null);
        storageService.save(teamShouldNotBeIncluded);

        teamNotification(team.getId(), "S123457");
        paNotification(paFrom.getId(), "S123457");
        paNotification(paTo.getId(), "S123457");
        init();
        team.setProductAreaId(paTo.getId());
        storageService.save(team);

        runCreateTasks();

        List<NotificationTask> tasks = storageService.getAll(NotificationTask.class);
        assertThat(tasks).hasSize(2);
        var slackTask = find(tasks, t -> t.getChannel() == NotificationChannel.SLACK);

        assertThat(slackTask.getTargets()).hasSize(3);
        var paFromTarget = find(slackTask.getTargets(), t -> t.getTargetId().equals(paFrom.getId()));
        var paToTarget = find(slackTask.getTargets(), t -> t.getTargetId().equals(paTo.getId()));
        var teamTarget = find(slackTask.getTargets(), t -> t.getTargetId().equals(team.getId()));

        var paFromAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(paFrom.getId().toString());
        var paToAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(paTo.getId().toString());
        var teamAudits = auditVersionRepository.findByTableIdOrderByTimeDesc(team.getId().toString());
        assertThat(paFromAudits).hasSize(1);
        assertThat(paToAudits).hasSize(1);
        assertThat(teamAudits).hasSize(2);
        var paFromAudit = paFromAudits.get(0);
        var paToAudit = paToAudits.get(0);

        assertThat(paFromTarget.isSilent()).isFalse();
        assertThat(paFromTarget.getPrevAuditId()).isNotNull().isEqualTo(paFromTarget.getCurrAuditId()).isEqualTo(paFromAudit.getId());
        assertThat(paToTarget.isSilent()).isFalse();
        assertThat(paToTarget.getPrevAuditId()).isNotNull().isEqualTo(paToTarget.getCurrAuditId()).isEqualTo(paToAudit.getId());

        assertThat(teamTarget.isSilent()).isTrue();
        assertThat(teamTarget.getPrevAuditId()).isEqualTo(teamAudits.get(1).getId());
        assertThat(teamTarget.getCurrAuditId()).isEqualTo(teamAudits.get(0).getId());

        var emailTask = find(tasks, t -> t.getChannel() == NotificationChannel.EMAIL);
        assertThat(emailTask.getTargets()).hasSize(1);
        assertThat(find(emailTask.getTargets(), t -> t.getTargetId().equals(team.getId())).isSilent()).isFalse();
    }

    @Test
    void testNudge() {
        var teamA = storageService.save(Team.builder()
                .name("team a")
                .status(DomainObjectStatus.ACTIVE)
                .build());
        var teamB = storageService.save(Team.builder()
                .name("team b")
                .status(DomainObjectStatus.ACTIVE)
                .build());
        var teamC = storageService.save(Team.builder()
                .name("team c")
                .status(DomainObjectStatus.PLANNED)
                .build());
        var teamD = storageService.save(Team.builder()
                .name("team d")
                .status(DomainObjectStatus.INACTIVE)
                .build());

        jdbcTemplate.execute("update generic_storage set last_modified_date = last_modified_date - interval '4 month' where id = '" + teamA.getId() + "'");
        jdbcTemplate.execute("update generic_storage set last_modified_date = last_modified_date - interval '4 month' where id = '" + teamC.getId() + "'");
        jdbcTemplate.execute("update generic_storage set last_modified_date = last_modified_date - interval '4 month' where id = '" + teamD.getId() + "'");

        scheduler.nudgeTime();

        assertThat(storageService.get(teamA.getId(), Team.class).getLastNudge()).isCloseTo(LocalDateTime.now(), new TemporalUnitLessThanOffset(1, ChronoUnit.SECONDS));
        assertThat(storageService.get(teamB.getId(), Team.class).getLastNudge()).isNull();
        assertThat(storageService.get(teamC.getId(), Team.class).getLastNudge()).isNull();
        assertThat(storageService.get(teamD.getId(), Team.class).getLastNudge()).isNull();
    }

    private void teamNotification(UUID teamId, String ident) {
        storageService.save(Notification.builder()
                .ident(ident)
                .target(teamId)
                .time(NotificationTime.ALL)
                .type(NotificationType.TEAM)
                .channels(List.of(NotificationChannel.EMAIL))
                .build());
    }

    private void paNotification(UUID paId, String ident) {
        storageService.save(Notification.builder()
                .ident(ident)
                .time(NotificationTime.ALL)
                .type(NotificationType.PA)
                .channels(List.of(NotificationChannel.SLACK))
                .target(paId)
                .build());
    }

    private void allNotifications(String ident) {
        storageService.save(Notification.builder()
                .ident(ident)
                .time(NotificationTime.ALL)
                .type(NotificationType.ALL_EVENTS)
                .channels(List.of(NotificationChannel.SLACK))
                .build());
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