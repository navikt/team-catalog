package no.nav.data.common.notify;

import no.nav.data.common.auditing.AuditVersionListener;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.notify.domain.Notification.NotificationTime;
import no.nav.data.common.notify.domain.NotificationTask;
import no.nav.data.common.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.common.notify.dto.MailModels.Item;
import no.nav.data.common.notify.dto.MailModels.UpdateItem;
import no.nav.data.common.notify.dto.MailModels.UpdateModel;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.template.FreemarkerConfig;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.NomMock;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamType;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class NotificationMailGeneratorTest {

    private final AuditVersionRepository auditVersionRepository = mock(AuditVersionRepository.class);
    private final SecurityProperties securityProperties = getSecurityProperties();
    private final StorageService storage = mock(StorageService.class);
    private final NotificationMailGenerator generator =
            new NotificationMailGenerator(securityProperties, auditVersionRepository, storage, new FreemarkerConfig().freemarkerService());

    @Test
    void update() {
        NomMock.init();
        var pa = ProductArea.builder()
                .id(UUID.randomUUID())
                .name("Pa start name")
                .build();

        var paOne = mockAudit(pa);
        pa.setName("Pa end name");
        pa.setMembers(List.of(PaMember.builder().navIdent(createNavIdent(0)).build()));
        var paTwo = mockAudit(pa);
        when(storage.get(pa.getId(), ProductArea.class)).thenReturn(pa);

        var one = mockAudit(Team.builder()
                .id(UUID.randomUUID())
                .name("Start name")
                .teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(0)).build(),
                        TeamMember.builder().navIdent(createNavIdent(1)).build()
                )).build());

        var two = mockAudit(Team.builder()
                .id(UUID.fromString(one.getTableId()))
                .name("End name")
                .productAreaId(pa.getId())
                .teamType(TeamType.PRODUCT)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(0)).build(),
                        TeamMember.builder().navIdent(createNavIdent(2)).build()
                )).build());

        var mail = generator.updateSummary(NotificationTask.builder()
                .time(NotificationTime.DAILY)
                .targets(List.of(
                        AuditTarget.builder()
                                .type("Team")
                                .targetId(UUID.fromString(one.getTableId()))
                                .prevAuditId(one.getId())
                                .currAuditId(two.getId())
                                .build(),
                        AuditTarget.builder()
                                .type("Team")
                                .targetId(UUID.fromString(one.getTableId()))
                                .currAuditId(two.getId())
                                .build(),
                        AuditTarget.builder()
                                .type("Team")
                                .targetId(UUID.fromString(one.getTableId()))
                                .prevAuditId(one.getId())
                                .build(),
                        AuditTarget.builder()
                                .type("ProductArea")
                                .targetId(pa.getId())
                                .prevAuditId(paOne.getId())
                                .currAuditId(paTwo.getId())
                                .build()
                ))
                .build());

        System.out.println(mail.getBody());
        assertThat(mail.getBody()).isNotNull();
        assertThat(mail.isEmpty()).isFalse();
        var model = ((UpdateModel) mail.getModel());

        assertThat(model.getTime()).isEqualTo(NotificationTime.DAILY);
        assertThat(model.getCreated()).contains(new Item("Team", url("team/", two.getTeamData().getId()), "End name"));
        assertThat(model.getDeleted()).contains(new Item("Team", url("team/", one.getTeamData().getId()), "Start name"));
        assertThat(model.getUpdated()).contains(new UpdateItem("Team", new Item(url("team/", two.getTeamData().getId()), "End name"),
                "Start name", "End name", Lang.teamType(TeamType.IT), Lang.teamType(TeamType.PRODUCT),
                null, null, pa.getName(), url("productarea/", pa.getId()),
                List.of(new Item(url("resource/", createNavIdent(1)), NomClient.getInstance().getNameForIdent(createNavIdent(1)))),
                List.of(new Item(url("resource/", createNavIdent(2)), NomClient.getInstance().getNameForIdent(createNavIdent(2)))),
                List.of(), List.of()
        ), new UpdateItem("Område", new Item(url("productarea/", pa.getId()), "Pa end name"),
                "Pa start name", "Pa end name", null, null,
                null, null, null, null,
                List.of(),
                List.of(new Item(url("resource/", createNavIdent(0)), NomClient.getInstance().getNameForIdent(createNavIdent(0)))),
                List.of(), List.of(new Item(url("team/", two.getTeamData().getId()), "End name"))
        ));
    }

    @Test
    void teamDeletedFromPa() {
        NomMock.init();
        var pa = ProductArea.builder()
                .id(UUID.randomUUID())
                .name("Pa start name")
                .build();

        var paOne = mockAudit(pa);
        when(storage.get(pa.getId(), ProductArea.class)).thenReturn(pa);
        Team team = Team.builder()
                .id(UUID.randomUUID())
                .name("Start name")
                .teamType(TeamType.IT)
                .productAreaId(pa.getId())
                .members(List.of()).build();
        var one = mockAudit(team);
        team.setProductAreaId(null);
        var two = mockAudit(team);

        var mail = generator.updateSummary(NotificationTask.builder()
                .time(NotificationTime.DAILY)
                .targets(List.of(
                        AuditTarget.builder()
                                .type("Team")
                                .targetId(UUID.fromString(one.getTableId()))
                                .prevAuditId(one.getId())
                                .build(),
                        AuditTarget.builder()
                                .type("ProductArea")
                                .targetId(pa.getId())
                                .prevAuditId(paOne.getId())
                                .currAuditId(paOne.getId())
                                .build()
                ))
                .build());

        System.out.println(mail.getBody());
        assertThat(mail.getBody()).isNotNull();
        assertThat(mail.isEmpty()).isFalse();
        var model = ((UpdateModel) mail.getModel());

        assertThat(model.getTime()).isEqualTo(NotificationTime.DAILY);
        assertThat(model.getDeleted()).contains(new Item("Team", url("team/", one.getTeamData().getId()), "Start name"));
        assertThat(model.getUpdated()).contains(new UpdateItem("Område", new Item(url("productarea/", pa.getId()), "Pa start name"),
                "Pa start name", "Pa start name", null, null,
                null, null, null, null,
                List.of(),
                List.of(),
                List.of(new Item(url("team/", two.getTeamData().getId()), "Start name", true)), List.of()
        ));
    }

    @Test
    void skipEmptyUpdate() {
        NomMock.init();
        Team team = Team.builder()
                .id(UUID.randomUUID())
                .name("Start name")
                .teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(0)).build(),
                        TeamMember.builder().navIdent(createNavIdent(1)).build()
                )).build();
        var one = mockAudit(team);
        team.setDescription("just edit description");
        var two = mockAudit(team);

        var mail = generator.updateSummary(NotificationTask.builder()
                .time(NotificationTime.DAILY)
                .targets(List.of(
                        AuditTarget.builder()
                                .type("Team")
                                .prevAuditId(one.getId())
                                .currAuditId(two.getId())
                                .build()
                ))
                .build());

        assertThat(mail.isEmpty()).isTrue();
    }

    @NotNull
    private String url(String type, Object id) {
        return "http://baseurl/" + type + id + "?source=updatemail";
    }

    private AuditVersion mockAudit(DomainObject domainObject) {
        GenericStorage gs = new GenericStorage();
        gs.setId(domainObject.getId());
        gs.setDomainObjectData(domainObject);
        AuditVersion audit = AuditVersionListener.convertAuditVersion(gs, Action.CREATE);
        assert audit != null;
        when(auditVersionRepository.findById(audit.getId())).thenReturn(Optional.of(audit));
        return audit;
    }

    private SecurityProperties getSecurityProperties() {
        SecurityProperties securityProperties = new SecurityProperties();
        securityProperties.setRedirectUris(List.of("http://baseurl"));
        securityProperties.setEnv("dev-fss");
        return securityProperties;
    }
}