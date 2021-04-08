package no.nav.data.team.notify;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.mail.MailTask;
import no.nav.data.team.IntegrationTestBase;
import no.nav.data.team.contact.domain.Channel;
import no.nav.data.team.contact.domain.ContactAddress;
import no.nav.data.team.notify.domain.GenericNotificationTask.InactiveMembers;
import no.nav.data.team.team.domain.Team;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.TestDataHelper.createResource;
import static org.assertj.core.api.Assertions.assertThat;

@Slf4j
class NotificationServiceIT extends IntegrationTestBase {

    @Autowired
    private NotificationService service;

    @BeforeEach
    void setUp() {
        addNomResource(createResource("Nordman", "Per", "A123456"));
    }

    @Test
    void nudge() {
        var team = Team.builder()
                .id(UUID.randomUUID())
                .name("Team 1")
                .contactAddresses(List.of(new ContactAddress("a@b.no", Channel.EPOST)))
                .build();
        service.nudge(team);

        var mails = storageService.getAll(MailTask.class);
        assertThat(mails).hasSize(1);
        MailTask mail = mails.get(0);

        log.info("mail {}", mail);
        assertThat(mail.getTo()).isEqualTo(team.getContactAddresses().get(0).getAdresse());
    }

    @Test
    void inactive() {
        var team = storageService.save(Team.builder()
                .name("Team 1")
                .contactAddresses(List.of(new ContactAddress("a@b.no", Channel.EPOST)))
                .build());
        service.inactive(InactiveMembers.builder()
                .teamId(team.getId())
                .identsInactive(List.of("A123456", "A123457"))
                .build());

        var mails = storageService.getAll(MailTask.class);
        assertThat(mails).hasSize(1);
        MailTask mail = mails.get(0);

        log.info("mail {}", mail);
        assertThat(mail.getTo()).isEqualTo(team.getContactAddresses().get(0).getAdresse());
    }

}