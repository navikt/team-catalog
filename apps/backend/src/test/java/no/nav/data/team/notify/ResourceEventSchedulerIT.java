package no.nav.data.team.notify;

import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.notify.domain.MailTask;
import no.nav.data.team.notify.domain.MailTask.InactiveMembers;
import no.nav.data.team.notify.domain.MailTask.TaskType;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceEvent;
import no.nav.data.team.resource.domain.ResourceEvent.EventType;
import no.nav.data.team.resource.dto.NomRessurs;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.util.List;

import static no.nav.data.common.utils.StreamUtils.find;
import static org.assertj.core.api.Assertions.assertThat;

class ResourceEventSchedulerIT extends IntegrationTestBase {

    @Autowired
    private ResourceEventScheduler scheduler;

    @BeforeEach
    void setUp() {
        nomClient.add(List.of(
                nomRessurs("S123450", LocalDate.now()),
                nomRessurs("S123451", LocalDate.now()),
                nomRessurs("S123456", LocalDate.now()),
                nomRessurs("s123457", null),
                nomRessurs("S123458", LocalDate.now().plusDays(1)),
                nomRessurs("S123459", LocalDate.now().minusDays(1))
        ));
    }

    @Test
    void generateResourceInactiveEvents() {
        storageService.save(Team.builder().members(List.of(TeamMember.builder().navIdent("S123450").build())).build());
        storageService.save(ProductArea.builder().members(List.of(PaMember.builder().navIdent("S123451").build())).build());

        scheduler.doGenerateInactiveResourceEvent();

        List<ResourceEvent> events = storageService.getAll(ResourceEvent.class);
        assertThat(events).hasSize(2);
        assertThat(find(events, e -> e.getIdent().equals("S123450")).getEventType()).isEqualTo(EventType.INACTIVE);
        assertThat(find(events, e -> e.getIdent().equals("S123451")).getEventType()).isEqualTo(EventType.INACTIVE);
    }

    @Test
    void processResourceEventsTeam() {
        var team = storageService.save(Team.builder().members(List.of(TeamMember.builder().navIdent("S123450").build(), TeamMember.builder().navIdent("S123457").build())).build());
        scheduler.doGenerateInactiveResourceEvent();
        assertThat(storageService.getAll(ResourceEvent.class)).hasSize(1);

        scheduler.doProcessResourceEvents();

        List<MailTask> tasks = storageService.getAll(MailTask.class);
        assertThat(tasks).hasSize(1);
        var task = tasks.get(0);
        assertThat(task.getTaskType()).isEqualTo(TaskType.InactiveMembers);
        var taskData = ((InactiveMembers) task.getTaskObject());
        assertThat(taskData.getTeamId()).isEqualTo(team.getId());
        assertThat(taskData.getProductAreaId()).isNull();
        assertThat(taskData.getIdentsInactive()).isEqualTo(List.of("S123450"));
        assertThat(storageService.getAll(ResourceEvent.class)).isEmpty();
    }

    @Test
    void processResourceEventsArea() {
        var area = storageService
                .save(ProductArea.builder().members(List.of(PaMember.builder().navIdent("S123450").build(), PaMember.builder().navIdent("S123457").build())).build());
        scheduler.doGenerateInactiveResourceEvent();
        assertThat(storageService.getAll(ResourceEvent.class)).hasSize(1);

        scheduler.doProcessResourceEvents();

        List<MailTask> tasks = storageService.getAll(MailTask.class);
        assertThat(tasks).hasSize(1);
        var task = tasks.get(0);
        assertThat(task.getTaskType()).isEqualTo(TaskType.InactiveMembers);
        var taskData = ((InactiveMembers) task.getTaskObject());
        assertThat(taskData.getTeamId()).isNull();
        assertThat(taskData.getProductAreaId()).isEqualTo(area.getId());
        assertThat(taskData.getIdentsInactive()).isEqualTo(List.of("S123450"));
        assertThat(storageService.getAll(ResourceEvent.class)).isEmpty();
    }

    private NomRessurs nomRessurs(String ident, LocalDate endDate) {
        return NomRessurs.builder().navident(ident).ressurstype("INTERN").sluttdato(endDate).build();
    }
}