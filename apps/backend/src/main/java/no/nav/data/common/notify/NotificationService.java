package no.nav.data.common.notify;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.NotificationTarget;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.azure.AzureAdService;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Service
public class NotificationService {

    private final StorageService storage;
    private final NomClient nomClient;
    private final AzureAdService azureAdService;

    private final AuditVersionRepository auditVersionRepository;
    private final NotificationMailGenerator mailGenerator;

    public NotificationService(StorageService storage, NomClient nomClient, AzureAdService azureAdService,
            AuditVersionRepository auditVersionRepository, NotificationMailGenerator mailGenerator) {
        this.azureAdService = azureAdService;
        this.storage = storage;
        this.nomClient = nomClient;
        this.auditVersionRepository = auditVersionRepository;
        this.mailGenerator = mailGenerator;
    }

    public Notification save(NotificationDto dto) {
        dto.validate();
        SecurityUtils.assertIsUserOrAdmin(dto.getIdent(), "Cannot edit other users notifications");
        if (dto.getId() != null) {
            throw new ValidationException("Cannot update notifications");
        }

        if (nomClient.getByNavIdent(dto.getIdent()).isEmpty()) {
            throw new ValidationException("Couldn't find user " + dto.getIdent());
        }

        return storage.save(new Notification(dto));
    }

    public Notification delete(UUID id) {
        var notification = storage.get(id, Notification.class);
        SecurityUtils.assertIsUserOrAdmin(notification.getIdent(), "Cannot delete other users notifications");
        return storage.delete(id, Notification.class);
    }

    public void notifyTask(NotificationTask task) {
        log.info("Sending notification for task {}", task);
        var mail = nomClient.getByNavIdent(task.getIdent()).map(Resource::getEmail)
                .orElseThrow(() -> new ValidationException("Can't find email for " + task.getIdent()));

        var message = mailGenerator.updateSummary(task);
        azureAdService.sendMail(message, "Teamkatalog oppdatering", mail);
    }

    /**
     * for test
     */
    public String diff(UUID idOne, UUID idTwo) {
        var type = Stream.of(idOne, idTwo).filter(Objects::nonNull).findFirst().flatMap(auditVersionRepository::findById).orElseThrow().getTable();
        return mailGenerator.updateSummary(
                NotificationTask.builder().time(NotificationTime.ALL)
                        .targets(List.of(
                                NotificationTarget.builder().type(type).prevAuditId(idOne).currAuditId(idTwo).build()))
                        .build());
    }

    public void testMail() {
        azureAdService.sendMail(nomClient.getByNavIdent(SecurityUtils.getCurrentIdent()).orElseThrow().getEmail(), "test", "testbody");
    }

}
