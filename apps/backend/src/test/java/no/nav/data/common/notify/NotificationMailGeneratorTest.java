package no.nav.data.common.notify;

import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.NotificationTarget;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.domain.TypeRegistration;
import no.nav.data.common.template.FreemarkerConfig;
import no.nav.data.common.utils.JsonUtils;
import no.nav.data.team.team.domain.Team;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class NotificationMailGeneratorTest {

    private final AuditVersionRepository auditVersionRepository = mock(AuditVersionRepository.class);
    private final SecurityProperties securityProperties = getSecurityProperties();

    private final NotificationMailGenerator generator = new NotificationMailGenerator(securityProperties, auditVersionRepository, new FreemarkerConfig().freemarkerService());

    @Test
    void update() {
        var one = mockAudit(Team.builder()
                .id(UUID.randomUUID())
                .name("Start name")
                .build());

        var two = mockAudit(Team.builder()
                .name("End name")
                .build());

        String document = generator.updateSummary(NotificationTask.builder()
                .time(NotificationTime.DAILY)
                .targets(List.of(
                        NotificationTarget.builder()
                                .type("Team")
                                .prevAuditId(one)
                                .currAuditId(two)
                                .build(),
                        NotificationTarget.builder()
                                .type("Team")
                                .currAuditId(two)
                                .build(),
                        NotificationTarget.builder()
                                .type("Team")
                                .prevAuditId(one)
                                .build()
                ))
                .build());

        System.out.println(document);
        assertThat(document).isNotNull();
    }

    private UUID mockAudit(Team team) {
        UUID auditId = UUID.randomUUID();
        when(auditVersionRepository.findById(auditId)).thenReturn(Optional.of(AuditVersion.builder()
                .id(auditId)
                .table(TypeRegistration.typeOf(team.getClass()))
                .data(JsonUtils.toJson(team))
                .build()));

        return auditId;
    }

    private SecurityProperties getSecurityProperties() {
        SecurityProperties securityProperties = new SecurityProperties();
        securityProperties.setRedirectUris(List.of("http://baseurl"));
        return securityProperties;
    }
}