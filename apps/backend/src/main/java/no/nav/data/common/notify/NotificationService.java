package no.nav.data.common.notify;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.azure.AzureAdService;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.NomClient;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class NotificationService {

    private final StorageService storage;
    private final NomClient nomClient;
    private final AzureAdService azureAdService;

    public NotificationService(StorageService storage, NomClient nomClient, AzureAdService azureAdService) {
        this.azureAdService = azureAdService;
        this.storage = storage;
        this.nomClient = nomClient;
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

    public void notifyTask(Notification notification, NotificationTask task) {
        log.info("Sending notification {} for task {}", notification, task);
        // TODO generate message and send


    }

}
