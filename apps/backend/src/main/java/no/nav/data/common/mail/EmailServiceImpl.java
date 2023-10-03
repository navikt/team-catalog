package no.nav.data.common.mail;

import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.StorageService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    public static final Logger logger = LogManager.getLogger(EmailServiceImpl.class);

    private final StorageService storage;
    private final EmailProvider emailProvider;
    private final SecurityProperties securityProperties;

    private final EmailClient emailClient;

    public EmailServiceImpl(StorageService storage, EmailProvider emailProvider,
            SecurityProperties securityProperties, EmailClient emailClient) {
        this.storage = storage;
        this.emailProvider = emailProvider;
        this.securityProperties = securityProperties;
        this.emailClient = emailClient;
    }

    @Override
    public void sendMail(MailTask mailTask) {
        var toSend = securityProperties.isDev() ? mailTask.withSubject("[DEV] " + mailTask.getSubject()) : mailTask;

        logger.info("Sending email to " + mailTask.getTo());

        emailClient.sendEmail(toSend);
    }

    @Override
    public void scheduleMail(MailTask mailTask) {
        storage.save(mailTask);
    }

    @SchedulerLock(name = "sendMail")
    @Scheduled(initialDelayString = "PT2M", fixedRateString = "PT1M")
    public void sendMail() {
        logger.info("Scheduled email sending to start");

        var tasks = storage.getAll(MailTask.class);

        tasks.forEach(task -> {
            sendMail(task);
            storage.delete(task);
        });
    }
}
