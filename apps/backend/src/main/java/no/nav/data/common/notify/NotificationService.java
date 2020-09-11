package no.nav.data.common.notify;

import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.NotificationRepository;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.NomClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final AuditVersionRepository auditVersionRepository;
    private final StorageService storage;
    private final NomClient nomClient;

    public NotificationService(NotificationRepository repository, AuditVersionRepository auditVersionRepository, StorageService storage, NomClient nomClient) {
        this.repository = repository;
        this.auditVersionRepository = auditVersionRepository;
        this.storage = storage;
        this.nomClient = nomClient;
    }

    public Notification save(NotificationDto dto) {
        dto.validate();
        SecurityUtils.assertIsUserOrAdmin(dto.getIdent(), "Cannot edit other users notifications");
        if (dto.getId() != null) {
            throw new ValidationException("Cannot update notifications");
        }

        nomClient.getByNavIdent(dto.getIdent()).orElseThrow(() -> new ValidationException("Couldn't find user " + dto.getIdent()));

        return storage.save(new Notification(dto));
    }

    public Notification delete(UUID id) {
        var notification = storage.get(id, Notification.class);
        SecurityUtils.assertIsUserOrAdmin(notification.getIdent(), "Cannot delete other users notifications");
        return storage.delete(id, Notification.class);
    }

    public void summary(NotificationTime time) {
        var localTime = switch (time) {
            case ALL -> LocalDateTime.now().minusMinutes(10);
            case DAILY -> LocalDateTime.now().minusHours(24);
            case WEEKLY -> LocalDateTime.now().minusDays(1);
            case MONTHLY -> LocalDateTime.now().minusMonths(1);
        };
        var audits = auditVersionRepository.summaryFor(localTime);
    }
}
