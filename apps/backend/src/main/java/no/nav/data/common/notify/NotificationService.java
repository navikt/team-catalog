package no.nav.data.common.notify;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.notify.NotificationService.UpdateModel.UpdateModelBuilder;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.azure.AzureAdService;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.template.FreemarkerConfig.FreemarkerService;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.team.domain.Team;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class NotificationService {

    private final StorageService storage;
    private final NomClient nomClient;
    private final AzureAdService azureAdService;

    private final AuditVersionRepository auditVersionRepository;
    private final FreemarkerService freemarkerService;

    public NotificationService(StorageService storage, NomClient nomClient, AzureAdService azureAdService,
            AuditVersionRepository auditVersionRepository, FreemarkerService freemarkerService) {
        this.azureAdService = azureAdService;
        this.storage = storage;
        this.nomClient = nomClient;
        this.auditVersionRepository = auditVersionRepository;
        this.freemarkerService = freemarkerService;
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
        var mail = nomClient.getByNavIdent(notification.getIdent()).map(Resource::getEmail)
                .orElseThrow(() -> new ValidationException("Can't find email for " + notification.getIdent()));
        var message = diff(task.getPrevAuditId(), task.getCurrAuditId());
        azureAdService.sendMail(message, "Teamkatalog oppatering", mail);
    }

    public String diff(UUID idOne, UUID idTwo) {
        var action = idOne == null ? Action.CREATE : idTwo == null ? Action.DELETE : Action.UPDATE;
        var startAudit = Optional.ofNullable(idOne).flatMap(auditVersionRepository::findById).orElse(null);
        var endAudit = Optional.ofNullable(idTwo).flatMap(auditVersionRepository::findById).orElse(null);

        if (startAudit == null && endAudit == null) {
            throw new ValidationException("both ids are null");
        }
        var table = startAudit != null ? startAudit.getTable() : endAudit.getTable();
        if (!table.equals(TypeRegistration.typeOf(Team.class)) && !table.equals(TypeRegistration.typeOf(ProductArea.class))) {
            throw new NotImplementedException("cannot diff " + table);
        } else if (action == Action.UPDATE && !Objects.equals(startAudit.getTableId(), endAudit.getTableId())) {
            throw new ValidationException(idOne + " and " + idTwo + " are different objects");
        }

        var model = UpdateModel.builder()
                .action(action.name())
                .type(table);

        if (table.equals(TypeRegistration.typeOf(Team.class)) && action == Action.UPDATE) {
            buildForTeamUpdate(startAudit, endAudit, model);
        }

        return freemarkerService.generate("update.ftl", model.build());
    }

    private void buildForTeamUpdate(AuditVersion startAudit, AuditVersion endAudit, UpdateModelBuilder model) {
        Assert.notNull(startAudit, "cant be null");
        Assert.notNull(endAudit, "cant be null");
        var start = JsonUtils.toObject(startAudit.getData(), Team.class);
        var end = JsonUtils.toObject(endAudit.getData(), Team.class);

        model.name(end.getName());
    }

    public void testMail() {
        azureAdService.sendMail(nomClient.getByNavIdent(SecurityUtils.getCurrentIdent()).orElseThrow().getEmail(), "test", "testbody");
    }

    @Data
    @Builder
    public static class UpdateModel {

        String action;
        String type;
        String name;
    }

}
