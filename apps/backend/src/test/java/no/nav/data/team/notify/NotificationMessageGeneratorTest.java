package no.nav.data.team.notify;

import no.nav.data.common.auditing.AuditVersionListener;
import no.nav.data.common.auditing.domain.Action;
import no.nav.data.common.auditing.domain.AuditVersion;
import no.nav.data.common.auditing.domain.AuditVersionRepository;
import no.nav.data.common.security.SecurityProperties;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.notify.domain.Notification.NotificationTime;
import no.nav.data.team.notify.domain.NotificationTask;
import no.nav.data.team.notify.domain.NotificationTask.AuditTarget;
import no.nav.data.team.notify.dto.MailModels.Resource;
import no.nav.data.team.notify.dto.MailModels.TypedItem;
import no.nav.data.team.notify.dto.MailModels.UpdateItem;
import no.nav.data.team.notify.dto.MailModels.UpdateModel;
import no.nav.data.team.notify.dto.MailModels.UpdateModel.TargetType;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.NomMock;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.find;
import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(NomMock.class)
class NotificationMessageGeneratorTest {

    private final AuditVersionRepository auditVersionRepository = mock(AuditVersionRepository.class);
    private final SecurityProperties securityProperties = UrlGeneratorTestUtil.getSecurityProperties();
    private final StorageService storage = mock(StorageService.class);
    private final NotificationMessageGenerator generator = new NotificationMessageGenerator(auditVersionRepository, storage, UrlGeneratorTestUtil.get(), NomClient.getInstance());

    @Test
    void update() {
        var pa = ProductArea.builder()
                .id(UUID.randomUUID())
                .name("Pa start name")
                .build();

        var paOne = mockAudit(pa);
        pa.setName("Pa end name");
        pa.setMembers(List.of(PaMember.builder().navIdent(createNavIdent(100)).build()));
        var paTwo = mockAudit(pa);
        when(storage.get(pa.getId(), ProductArea.class)).thenReturn(pa);

        var one = mockAudit(Team.builder()
                .id(UUID.randomUUID())
                .name("Start name")
                .teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(100)).build(),
                        TeamMember.builder().navIdent(createNavIdent(101)).build()
                )).build());

        var two = mockAudit(Team.builder()
                .id(UUID.fromString(one.getTableId()))
                .name("End name")
                .teamType(TeamType.PRODUCT)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(100)).build(),
                        TeamMember.builder().navIdent(createNavIdent(102)).build()
                )).build());

        var three = mockAudit(Team.builder()
                .id(UUID.fromString(one.getTableId()))
                .name("End name")
                .productAreaId(pa.getId())
                .teamType(TeamType.PRODUCT)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(100)).build(),
                        TeamMember.builder().navIdent(createNavIdent(102)).build()
                )).build());

        var mail = generator.updateSummary(NotificationTask.builder()
                .time(NotificationTime.DAILY)
                .targets(List.of(
                        AuditTarget.builder()
                                .type("Team")
                                .targetId(UUID.fromString(one.getTableId()))
                                .prevAuditId(one.getId())
                                .currAuditId(three.getId())
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

        assertThat(mail.isEmpty()).isFalse();
        var model = ((UpdateModel) mail.getModel());

        assertThat(model.getTime()).isEqualTo(NotificationTime.DAILY);
        assertThat(model.getCreated()).contains(new TypedItem(TargetType.TEAM, two.getTeamData().getId().toString(), url("team/", two.getTeamData().getId()), "End name"));
        assertThat(model.getDeleted()).contains(new TypedItem(TargetType.TEAM, one.getTeamData().getId().toString(), url("team/", one.getTeamData().getId()), "Start name", true));
        assertThat(model.getUpdated()).hasSize(2);
        var teamUpdate = find(model.getUpdated(), u -> u.getItem().getType().equals(TargetType.TEAM));
        var paUpdate = find(model.getUpdated(), u -> u.getItem().getType().equals(TargetType.AREA));
        assertThat(teamUpdate).isEqualTo(new UpdateItem(new TypedItem(TargetType.TEAM, two.getTeamData().getId().toString(), url("team/", two.getTeamData().getId()), "End name"),
                "Start name", "End name", Lang.teamType(TeamType.IT), Lang.teamType(TeamType.PRODUCT),
                null, convPa(pa),
                List.of(new Resource(url("resource/", createNavIdent(101)), NomClient.getInstance().getNameForIdent(createNavIdent(101)).orElseThrow(), createNavIdent(101))),
                List.of(new Resource(url("resource/", createNavIdent(102)), NomClient.getInstance().getNameForIdent(createNavIdent(102)).orElseThrow(), createNavIdent(102))),
                List.of(), List.of()
        ));
        assertThat(paUpdate).isEqualTo(new UpdateItem(new TypedItem(TargetType.AREA, pa.getId().toString(), url("area/", pa.getId()), "Pa end name"),
                "Pa start name", "Pa end name", "", "",
                null, null,
                List.of(),
                List.of(new Resource(url("resource/", createNavIdent(100)), NomClient.getInstance().getNameForIdent(createNavIdent(100)).orElseThrow(), createNavIdent(100))),
                List.of(), List.of(new TypedItem(TargetType.TEAM, two.getTeamData().getId().toString(), url("team/", two.getTeamData().getId()), "End name"))
        ));
    }

    @Test
    void teamSwitchPa() {
        var paFrom = ProductArea.builder()
                .id(UUID.randomUUID())
                .name("Pa name from")
                .build();

        var paTo = ProductArea.builder()
                .id(UUID.randomUUID())
                .name("Pa name to")
                .build();

        var paFromAudit = mockAudit(paFrom);
        var paToAudit = mockAudit(paTo);
        when(storage.get(paFrom.getId(), ProductArea.class)).thenReturn(paFrom);
        when(storage.get(paTo.getId(), ProductArea.class)).thenReturn(paTo);

        Team team = Team.builder()
                .id(UUID.randomUUID())
                .productAreaId(paFrom.getId())
                .name("Team name")
                .teamType(TeamType.IT)
                .members(List.of()).build();
        mockAudit(team);
        var two = mockAudit(team);
        team.setProductAreaId(paTo.getId());
        var three = mockAudit(team);

        var mail = generator.updateSummary(NotificationTask.builder()
                .time(NotificationTime.DAILY)
                .targets(List.of(
                        AuditTarget.builder()
                                .type("Team")
                                .targetId(team.getId())
                                .prevAuditId(two.getId())
                                .currAuditId(three.getId())
                                .build(),
                        AuditTarget.builder()
                                .type("ProductArea")
                                .targetId(paFrom.getId())
                                .prevAuditId(paFromAudit.getId())
                                .currAuditId(paFromAudit.getId())
                                .build(),
                        AuditTarget.builder()
                                .type("ProductArea")
                                .targetId(paTo.getId())
                                .prevAuditId(paToAudit.getId())
                                .currAuditId(paToAudit.getId())
                                .build()
                ))
                .build());

        assertThat(mail.isEmpty()).isFalse();
        var model = ((UpdateModel) mail.getModel());

        assertThat(model.getUpdated()).contains(new UpdateItem(new TypedItem(TargetType.TEAM, team.getId().toString(), url("team/", team.getId()), team.getName()),
                        team.getName(), team.getName(), Lang.teamType(TeamType.IT), Lang.teamType(TeamType.IT),
                        convPa(paFrom), convPa(paTo),
                        List.of(), List.of(), List.of(), List.of()),
                new UpdateItem(new TypedItem(TargetType.AREA, paFrom.getId().toString(), url("area/", paFrom.getId()), paFrom.getName()),
                        paFrom.getName(), paFrom.getName(), "", "",
                        null, null,
                        List.of(),
                        List.of(),
                        List.of(new TypedItem(TargetType.TEAM, team.getId().toString(), url("team/", team.getId()), team.getName())), List.of()
                ), new UpdateItem(new TypedItem(TargetType.AREA, paTo.getId().toString(), url("area/", paTo.getId()), paTo.getName()),
                        paTo.getName(), paTo.getName(), "", "",
                        null, null,
                        List.of(),
                        List.of(),
                        List.of(), List.of(new TypedItem(TargetType.TEAM, team.getId().toString(), url("team/", team.getId()), team.getName()))
                ));
    }

    @Test
    void teamDeletedFromPa() {
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

        assertThat(mail.isEmpty()).isFalse();
        var model = ((UpdateModel) mail.getModel());

        assertThat(model.getTime()).isEqualTo(NotificationTime.DAILY);
        assertThat(model.getDeleted()).contains(new TypedItem(TargetType.TEAM, one.getTeamData().getId().toString(), url("team/", one.getTeamData().getId()), "Start name", true));
        assertThat(model.getUpdated()).contains(new UpdateItem(new TypedItem(TargetType.AREA, pa.getId().toString(), url("area/", pa.getId()), "Pa start name"),
                "Pa start name", "Pa start name", "", "",
                null, null,
                List.of(),
                List.of(),
                List.of(new TypedItem(TargetType.TEAM, two.getTeamData().getId().toString(), url("team/", two.getTeamData().getId()), "Start name", true)), List.of()
        ));
    }

    @Test
    void skipEmptyUpdate() {
        Team team = Team.builder()
                .id(UUID.randomUUID())
                .name("Start name")
                .teamType(TeamType.IT)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(100)).build(),
                        TeamMember.builder().navIdent(createNavIdent(101)).build()
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

    private String url(String type, Object id) {
        return securityProperties.findBaseUrl() + "/" + type + id;
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

    private TypedItem convPa(ProductArea pa) {
        return new TypedItem(TargetType.AREA, pa.getId().toString(), url("area/", pa.getId()), pa.getName());
    }

}