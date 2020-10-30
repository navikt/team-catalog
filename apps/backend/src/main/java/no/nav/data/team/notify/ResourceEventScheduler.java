package no.nav.data.team.notify;

import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.team.notify.domain.MailTask;
import no.nav.data.team.notify.domain.MailTask.InactiveMembers;
import no.nav.data.team.notify.domain.MailTask.TaskType;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.ResourceEvent;
import no.nav.data.team.resource.domain.ResourceEvent.EventType;
import no.nav.data.team.shared.domain.Member;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.Team;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.convertFlat;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.union;

@Slf4j
@Component
public class ResourceEventScheduler {

    private final StorageService storage;
    private final NotificationService service;

    public ResourceEventScheduler(StorageService storage, NotificationService service) {
        this.storage = storage;
        this.service = service;
    }

    @Scheduled(cron = "45 */4 * * * ?")
    @SchedulerLock(name = "runMailTasks")
    public void runMailTasks() {
        doRunMailTasks();
    }

    @Scheduled(cron = "0 0 11 * * ?")
    @SchedulerLock(name = "generateInactiveResourceEvent")
    public void generateInactiveResourceEvent() {
        // must run before resourceEvents job
        // if the inactive flag is received the same day through NomListener, we do not want to send out message twice
        doGenerateInactiveResourceEvent();
    }

    @Scheduled(cron = "0 0 12 * * ?")
    @SchedulerLock(name = "processResourceEvents")
    public void processResourceEvents() {
        doProcessResourceEvents();
    }

    void doRunMailTasks() {
        List<MailTask> events = storage.getAll(MailTask.class);

        for (MailTask task : events) {
            log.info("Running mail task {}", task);
            if (task.getTaskType() == TaskType.InactiveMembers) {
                service.inactive(((InactiveMembers) task.getTaskObject()));
                storage.delete(task);
            }
        }
    }

    void doGenerateInactiveResourceEvent() {
        List<Member> members = union(
                convertFlat(allTeams(), Membered::getMembers),
                convertFlat(allAreas(), Membered::getMembers)
        );

        members.stream()
                .map(Member::getNavIdent).distinct()
                .map(ident -> NomClient.getInstance().getByNavIdent(ident))
                .forEach(or -> or.ifPresent(r -> {
                    if (r.isInactive() && r.getEndDate().equals(LocalDate.now())) {
                        log.info("ident {} became inactive today, creating ResourceEvent", r.getNavIdent());
                        storage.save(ResourceEvent.builder().eventType(EventType.INACTIVE).ident(r.getNavIdent()).build());
                    }
                }));
    }

    void doProcessResourceEvents() {
        List<ResourceEvent> events = storage.getAll(ResourceEvent.class);
        // Expand/refactor if new event types

        var inactiveEvents = filter(events, e -> e.getEventType() == EventType.INACTIVE);
        var perResource = inactiveEvents.stream().collect(toMap(ResourceEvent::getIdent, Function.identity(), DomainObject::max));

        convert(allTeams(), t -> checkGoneInactive(t, perResource))
                .forEach(ina -> storage.save(new MailTask(new InactiveMembers(ina.getMembered().getId(), null, ina.getIdents()))));
        convert(allAreas(), t -> checkGoneInactive(t, perResource))
                .forEach(ina -> storage.save(new MailTask(new InactiveMembers(null, ina.getMembered().getId(), ina.getIdents()))));
        storage.deleteAll(inactiveEvents);
    }

    private Ina checkGoneInactive(Membered membered, Map<String, ResourceEvent> events) {
        var newInactiveIdents = membered.getMembers().stream()
                .filter(m -> events.containsKey(m.getNavIdent()))
                .map(Member::getNavIdent).distinct().collect(toList());
        if (newInactiveIdents.isEmpty()) {
            return null;
        }
        Ina ina = new Ina(membered, newInactiveIdents);
        log.info("Inactive {} {} {}", membered.type(), membered.getName(), newInactiveIdents);
        return ina;
    }

    @Value
    public static class Ina {

        Membered membered;
        List<String> idents;
    }

    private List<ProductArea> allAreas() {
        return storage.getAll(ProductArea.class);
    }

    private List<Team> allTeams() {
        return storage.getAll(Team.class);
    }

}
