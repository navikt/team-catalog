package no.nav.data.common.notify;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.notify.domain.Notification;
import no.nav.data.common.notify.domain.Notification.NotificationChannel;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.common.notify.dto.NotificationDto;
import no.nav.data.common.notify.slack.SlackClient;
import no.nav.data.common.notify.slack.SlackMessageConverter;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.azure.AzureAdService;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.TeamRole;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static no.nav.data.common.utils.StreamUtils.safeStream;

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

    public NotificationService(StorageService storage, NomClient nomClient, AzureAdService azureAdService,
            TemplateService templateService, SlackClient slackClient, SlackMessageConverter slackMessageConverter,
            AuditVersionRepository auditVersionRepository,
            NotificationMessageGenerator messageGenerator) {
        this.azureAdService = azureAdService;
        this.storage = storage;
        this.nomClient = nomClient;
        this.templateService = templateService;
        this.slackClient = slackClient;
        this.slackMessageConverter = slackMessageConverter;
        this.auditVersionRepository = auditVersionRepository;
        this.messageGenerator = messageGenerator;
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
            String body = templateService.teamUpdate(message.getModel());
            azureAdService.sendMail(email, message.getSubject(), body);
        } else if (task.getChannel() == NotificationChannel.SLACK) {
            var blocks = slackMessageConverter.convertTeamUpdateModel(message.getModel());
            slackClient.sendMessage(email, blocks);
        }
    }

    public void nudge(Membered object) {
        List<String> recipients = getEmails(object, TeamRole.LEAD);
        if (recipients.isEmpty()) {
            recipients = getEmails(object, TeamRole.PRODUCT_OWNER);
        }
        if (recipients.isEmpty()) {
            log.info("No recipients found for nudge to {}: {}", object.type(), object.getName());
            return;
        }
        var message = messageGenerator.nudgeTime(object);

        recipients.forEach(r -> azureAdService.sendMail(r, message.getSubject(), templateService.nudge(message.getModel())));
    }

    private List<String> getEmails(Membered object, TeamRole role) {
        return safeStream(object.getMembers())
                .filter(m -> m.getRoles().contains(role))
                .map(l -> getEmailForIdent(l.getNavIdent()))
                .collect(Collectors.toList());
    }

    private String getEmailForIdent(String ident) {
        return nomClient.getByNavIdent(ident).map(Resource::getEmail)
                .orElseThrow(() -> new ValidationException("Can't find email for " + ident));
    }

    /**
     * for test
     */
    public String testDiff(UUID idOne, UUID idTwo) {
        var type = Stream.of(idOne, idTwo).filter(Objects::nonNull).findFirst().flatMap(auditVersionRepository::findById).orElseThrow().getTable();
        return templateService.teamUpdate(
                messageGenerator.updateSummary(
                        NotificationTask.builder().time(NotificationTime.ALL)
                                .targets(List.of(
                                        AuditTarget.builder().type(type).prevAuditId(idOne).currAuditId(idTwo).build()))
                                .build()).getModel()
        );
    }

    public void testMail() {
        azureAdService.sendMail(nomClient.getByNavIdent(SecurityUtils.getCurrentIdent()).orElseThrow().getEmail(), "test", "testbody");
    }
}
