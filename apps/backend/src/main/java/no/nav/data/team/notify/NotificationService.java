package no.nav.data.team.notify;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.azure.AzureAdService;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.notify.NotificationMessageGenerator.NotificationMessage;
import no.nav.data.team.notify.domain.MailTask.InactiveMembers;
import no.nav.data.team.notify.domain.Notification;
import no.nav.data.team.notify.domain.Notification.NotificationChannel;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.domain.Notification.NotificationType;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
import no.nav.data.team.notify.dto.NotificationDto;
import no.nav.data.team.notify.slack.SlackClient;
import no.nav.data.team.notify.slack.SlackMessageConverter;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.TeamRole;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.utils.StreamUtils.tryFind;

@Slf4j
@Service
public class NotificationService {

    private final StorageService storage;
    private final NomClient nomClient;
    private final AzureAdService azureAdService;
    private final TemplateService templateService;
    private final SlackClient slackClient;
    private final SlackMessageConverter slackMessageConverter;

    private final AuditVersionRepository auditVersionRepository;
    private final NotificationMessageGenerator messageGenerator;
    private final AuditDiffService auditDiffService;
    private final SecurityProperties securityProperties;

    public NotificationService(StorageService storage, NomClient nomClient, AzureAdService azureAdService,
            TemplateService templateService, SlackClient slackClient, SlackMessageConverter slackMessageConverter,
            AuditVersionRepository auditVersionRepository,
            NotificationMessageGenerator messageGenerator, AuditDiffService auditDiffService, SecurityProperties securityProperties) {
        this.azureAdService = azureAdService;
        this.storage = storage;
        this.nomClient = nomClient;
        this.templateService = templateService;
        this.slackClient = slackClient;
        this.slackMessageConverter = slackMessageConverter;
        this.auditVersionRepository = auditVersionRepository;
        this.messageGenerator = messageGenerator;
        this.auditDiffService = auditDiffService;
        this.securityProperties = securityProperties;
    }

    public Notification save(NotificationDto dto) {
        dto.validate();
        SecurityUtils.assertIsUserOrAdmin(dto.getIdent(), "Cannot edit other users notifications");

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
        var email = getEmailForIdent(task.getIdent());

        var message = messageGenerator.updateSummary(task);
        if (message.isEmpty()) {
            log.info("Skipping task, end message is empty taskId {}", task.getId());
            return;
        }
        if (task.getChannel() == NotificationChannel.EMAIL) {
            sendUpdateMail(email, message.getModel(), message.getSubject());
        } else if (task.getChannel() == NotificationChannel.SLACK) {
            var blocks = slackMessageConverter.convertTeamUpdateModel(message.getModel());
            try {
                slackClient.sendMessageToUser(email, blocks);
            } catch (NotFoundException e) {
                sendUpdateMail(email, message.getModel(), message.getSubject() + " - Erstatning for slack melding. Klarte ikke finne din slack bruker.");
            }
        }
    }

    private void sendUpdateMail(String email, UpdateModel model, String subject) {
        String body = templateService.teamUpdate(model);
        azureAdService.sendMail(email, subject, body);
    }

    public void nudge(Membered object) {
        var recipients = getRecipients(object);
        if (recipients.isEmpty()) {
            log.info("No recipients found for nudge to {}: {}", object.type(), object.getName());
            return;
        }
        var message = messageGenerator.nudgeTime(object, recipients.role());
        String body = templateService.nudge(message.getModel());
        sendMessage(object, recipients, message, body);
    }

    public void inactive(InactiveMembers task) {
        Membered object = storage.get(task.getId(), task.getType());

        var recipients = getRecipients(object);
        if (recipients.isEmpty()) {
            log.info("No recipients found for inactive notification to {}: {}", object.type(), object.getName());
            return;
        }
        var message = messageGenerator.inactive(object, recipients.role(), task.getIdentsInactive());
        String body = templateService.inactive(message.getModel());
        sendMessage(object, recipients, message, body);
    }

    private void sendMessage(Membered object, Recipients recipients, NotificationMessage<?> message, String body) {
        recipients.emails().stream()
                // this feature does not only send messages to people who subscribe, so lets filter out random people in dev
                .filter(r -> !message.isDev() || securityProperties.isDevEmailAllowed(r))
                .forEach(r -> {
                    log.info("Sending '{}' for {} {} to {}", message.getSubject(), object.type(), object.getName(), r);
                    azureAdService.sendMail(r, message.getSubject(), body);
                });
    }

    private Recipients getRecipients(Membered object) {
        var role = TeamRole.LEAD;
        List<String> recipients = getEmails(object, role);
        if (recipients.isEmpty()) {
            role = TeamRole.PRODUCT_OWNER;
            recipients = getEmails(object, role);
        }
        return new Recipients(role, recipients);
    }

    private List<String> getEmails(Membered object, TeamRole role) {
        return safeStream(object.getMembers())
                .filter(m -> m.getRoles().contains(role))
                .map(l -> {
                    try {
                        return getEmailForIdent(l.getNavIdent());
                    } catch (MailNotFoundException e) {
                        log.warn("email", e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private String getEmailForIdent(String ident) {
        return nomClient.getByNavIdent(ident).map(Resource::getEmail)
                .orElseThrow(() -> new MailNotFoundException("Can't find email for " + ident));
    }

    public String changelog(NotificationType type, UUID targetId, LocalDateTime start, LocalDateTime end) {
        var notifications = List.of(Notification.builder()
                .channels(List.of(NotificationChannel.EMAIL))
                .target(targetId)
                .type(type)
                .ident("MANUAL")
                .time(NotificationTime.ALL)
                .build());
        var audits = auditVersionRepository.findByTimeBetween(start, end);
        var tasks = auditDiffService.createTask(audits, notifications);
        var task = tryFind(tasks, t -> t.getChannel() == NotificationChannel.EMAIL);
        if (task.isEmpty() || task.get().getTargets().isEmpty()) {
            return "empty";
        }
        var message = messageGenerator.updateSummary(task.get());
        log.info("new {} removes {} updates {}", message.getModel().getCreated(), message.getModel().getDeleted(), message.getModel().getUpdated());
        return templateService.teamUpdate(message.getModel());
    }

    public void testMail() {
        azureAdService.sendMail(nomClient.getByNavIdent(SecurityUtils.getCurrentIdent()).orElseThrow().getEmail(), "test", "testbody");
    }

    record Recipients(TeamRole role, List<String> emails) {

        boolean isEmpty() {
            return emails.isEmpty();
        }

    }
}
