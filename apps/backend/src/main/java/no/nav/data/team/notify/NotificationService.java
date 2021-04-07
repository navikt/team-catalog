package no.nav.data.team.notify;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.mail.EmailService;
import no.nav.data.common.mail.MailTask;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.utils.MetricUtils;
import no.nav.data.team.contact.domain.ContactAddress;
import no.nav.data.team.contact.domain.ContactMessage;
import no.nav.data.team.integration.slack.SlackClient;
import no.nav.data.team.notify.domain.GenericNotificationTask.InactiveMembers;
import no.nav.data.team.notify.domain.Notification;
import no.nav.data.team.notify.domain.Notification.NotificationChannel;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.domain.Notification.NotificationType;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.notify.dto.Changelog;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
import no.nav.data.team.notify.dto.NotificationDto;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.safeStream;
import static no.nav.data.common.utils.StreamUtils.tryFind;
import static no.nav.data.team.contact.domain.AdresseType.EPOST;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final StorageService storage;
    private final NomClient nomClient;
    private final EmailService emailService;
    private final TemplateService templateService;
    private final SlackClient slackClient;
    private final NotificationSlackMessageConverter notificationSlackMessageConverter;

    private final AuditVersionRepository auditVersionRepository;
    private final NotificationMessageGenerator messageGenerator;
    private final AuditDiffService auditDiffService;
    private final SecurityProperties securityProperties;
    private final Cache<String, Changelog> changelogCache = MetricUtils.register("changelogCache",
            Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofMinutes(15))
                    .maximumSize(500)
                    .recordStats().build());

    // changes before this date have non-backwards compatible formats
    private static final LocalDateTime earliestChangelog = LocalDateTime.of(2020, Month.APRIL, 24, 0, 0);

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
            var blocks = notificationSlackMessageConverter.convertTeamUpdateModel(message.getModel());
            try {
                slackClient.sendMessageToUser(email, blocks);
            } catch (NotFoundException e) {
                sendUpdateMail(email, message.getModel(), message.getSubject() + " - Erstatning for slack melding. Klarte ikke finne din slack bruker.");
            }
        }
    }

    private void sendUpdateMail(String email, UpdateModel model, String subject) {
        String body = templateService.teamUpdate(model);
        emailService.sendMail(MailTask.builder().to(email).subject(subject).body(body).build());
    }

    public void nudge(Membered object) {
        sendMessage(object, recipients -> messageGenerator.nudgeTime(object, recipients.role()));
    }

    public void inactive(InactiveMembers task) {
        Membered object = storage.get(task.getId(), task.getType());
        sendMessage(object, recipients -> messageGenerator.inactive(object, recipients.role(), task.getIdentsInactive()));
    }

    private void sendMessage(Membered membered, Function<Recipients, ContactMessage> messageGenerator) {
        var recipients = getRecipients(membered);
        if (recipients.isEmpty()) {
            log.info("No recipients found for contact to {}: {}", membered.type(), membered.getName());
            return;
        }
        var contactMessage = messageGenerator.apply(recipients);
        // TODO consider schedule slack messages async (like email) to guard against slack downtime
        for (var recipient : recipients.addresses) {
            switch (recipient.getType()) {
                case EPOST -> emailService.scheduleMail(MailTask.builder().to(recipient.getAdresse()).subject(contactMessage.getTitle()).body(contactMessage.toHtml()).build());
                case SLACK -> slackClient.sendMessageToChannel(recipient.getAdresse(), contactMessage.toSlack());
                case SLACK_USER -> slackClient.sendMessageToUserId(recipient.getAdresse(), contactMessage.toSlack());
                default -> throw new NotImplementedException("%s is not an implemented varsel type".formatted(recipient.getType()));
            }
        }
    }

    private Recipients getRecipients(Membered object) {
        if (object instanceof Team team) {
            if (!CollectionUtils.isEmpty(team.getContactAddresses())) {
                return new Recipients("Kontaktadresse", team.getContactAddresses());
            } else if (!StringUtils.isBlank(team.getContactPersonIdent())) {
                return new Recipients("Kontaktperson", List.of(new ContactAddress(getEmailForIdent(team.getContactPersonIdent()), EPOST)));
            }
        }
        var role = TeamRole.LEAD;
        List<String> emails = getEmails(object, role);
        if (emails.isEmpty()) {
            role = TeamRole.PRODUCT_OWNER;
            emails = getEmails(object, role);
        }
        return new Recipients(Lang.roleName(role), convert(emails, e -> new ContactAddress(e, EPOST)));
    }

    private List<String> getEmails(Membered object, TeamRole role) {
        return safeStream(object.getMembers())
                .filter(m -> m.getRoles().contains(role))
                .map(l -> {
                    try {
                        return getEmailForIdent(l.getNavIdent());
                    } catch (MailNotFoundException e) {
                        log.warn("email not found", e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private String getEmailForIdent(String ident) {
        return nomClient.getByNavIdent(ident)
                .map(Resource::getEmail)
                .orElseThrow(() -> new MailNotFoundException("Can't find email for " + ident));
    }

    public String changelogMail(NotificationType type, UUID targetId, LocalDateTime start, LocalDateTime end) {
        var model = changelog(type, targetId, start, end);
        if (model == null) {
            return "empty";
        }
        log.info("new {} removes {} updates {}", model.getCreated(), model.getDeleted(), model.getUpdated());
        return templateService.teamUpdate(model);
    }

    public Changelog changelogJson(NotificationType type, UUID targetId, LocalDateTime start, LocalDateTime end) {
        return changelogCache.get("" + type + targetId + start + end, k -> Changelog.from(changelog(type, targetId, start, end)));
    }

    private UpdateModel changelog(NotificationType type, UUID targetId, LocalDateTime start, LocalDateTime end) {
        var notifications = List.of(Notification.builder()
                .channels(List.of(NotificationChannel.EMAIL))
                .target(targetId)
                .type(type)
                .ident("MANUAL")
                .time(NotificationTime.ALL)
                .build());
        start = start.isBefore(earliestChangelog) ? earliestChangelog : start;
        var audits = auditVersionRepository.findByTimeBetween(start, end);
        var tasks = auditDiffService.createTask(audits, notifications);
        var task = tryFind(tasks, t -> t.getChannel() == NotificationChannel.EMAIL);
        if (task.isEmpty() || task.get().getTargets().isEmpty()) {
            return null;
        }
        return messageGenerator.updateSummary(task.get()).getModel();
    }

    public void testMail() {
        var email = SecurityUtils.getCurrentUser().map(UserInfo::getEmail).orElseThrow();
        emailService.sendMail(MailTask.builder().to(email).subject("test").body("testbody").build());
    }

    record Recipients(String role, List<ContactAddress> addresses) {

        boolean isEmpty() {
            return addresses.isEmpty();
        }

    }
}
