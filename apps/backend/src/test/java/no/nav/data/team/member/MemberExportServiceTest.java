package no.nav.data.team.member;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.domain.ClusterMember;
import no.nav.data.team.member.MemberExportService.SpreadsheetType;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomMock;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;

@Slf4j
@ExtendWith({MockitoExtension.class, NomMock.class})
class MemberExportServiceTest {

    @Mock
    private TeamService teamService;
    @Mock
    private ProductAreaService productAreaService;
    @Mock
    private ClusterService clusterService;
    @InjectMocks
    private MemberExportService memberExportService;

    Team teamOne = createTeam(1, null, List.of());
    ProductArea paOne = createPa(1);
    Cluster clusterOne = createCluster(1, null);
    Cluster clusterTwo = createCluster(2, paOne.getId());

    @BeforeEach
    void setUp() {
        lenient().when(productAreaService.getAll()).thenReturn(List.of(paOne, createPa(2), createPa(3)));
        lenient().when(productAreaService.get(any())).thenReturn(paOne);
        lenient().when(clusterService.getAll()).thenReturn(List.of(clusterOne, clusterTwo, createCluster(3, null)));
        lenient().when(clusterService.get(clusterOne.getId())).thenReturn(clusterOne);
        lenient().when(clusterService.get(clusterTwo.getId())).thenReturn(clusterTwo);
        lenient().when(teamService.getAll()).thenReturn(List.of(
                teamOne,
                createTeam(2, paOne.getId(), List.of(clusterOne.getId())),
                createTeam(3, null, List.of(clusterOne.getId(), clusterTwo.getId())))
        );
        lenient().when(teamService.get(teamOne.getId())).thenReturn(teamOne);
    }

    @Test
    void getAll() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.ALL, null);
        assertThat(spreadsheet).isNotNull();
        write(spreadsheet);
    }

    @Test
    void getPa() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.PRODUCT_AREA, paOne.getId().toString());
        assertThat(spreadsheet).isNotNull();
        write(spreadsheet);
    }


    @Test
    void getCluster() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.CLUSTER, clusterOne.getId().toString());
        assertThat(spreadsheet).isNotNull();
        write(spreadsheet);
    }

    @Test
    void getTeam() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.TEAM, teamOne.getId().toString());
        assertThat(spreadsheet).isNotNull();
        write(spreadsheet);
    }

    @Test
    void getRole() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.ROLE, TeamRole.DEVELOPER.name());
        assertThat(spreadsheet).isNotNull();
        write(spreadsheet);
    }

    private ProductArea createPa(int nr) {
        return ProductArea.builder()
                .id(UUID.randomUUID())
                .name("Produktområde " + nr)
                .members(List.of(
                        PaMember.builder().navIdent(createNavIdent(100)).description("Beskrivelse 1").roles(List.of(TeamRole.LEAD, TeamRole.TESTER)).build(),
                        PaMember.builder().navIdent(createNavIdent(101)).description("Beskrivelse 2").roles(List.of(TeamRole.DEVELOPER)).build())
                )
                .build();
    }

    private Cluster createCluster(int nr, UUID productAreaId) {
        return Cluster.builder()
                .id(UUID.randomUUID())
                .name("Cluster " + nr)
                .productAreaId(productAreaId)
                .members(List.of(
                        ClusterMember.builder().navIdent(createNavIdent(100)).description("Beskrivelse 1").roles(List.of(TeamRole.LEAD, TeamRole.TESTER)).build(),
                        ClusterMember.builder().navIdent(createNavIdent(101)).description("Beskrivelse 2").roles(List.of(TeamRole.DEVELOPER)).build())
                )
                .build();
    }

    private Team createTeam(int nr, UUID productAreaId, List<UUID> clusterIds) {
        return Team.builder()
                .id(UUID.randomUUID())
                .name("Team " + nr)
                .productAreaId(productAreaId)
                .clusterIds(clusterIds)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(100)).description("Beskrivelse 1").roles(List.of(TeamRole.LEAD, TeamRole.TESTER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(101)).description("Beskrivelse 2").roles(List.of(TeamRole.DEVELOPER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(102)).description("Beskrivelse 3").roles(List.of(TeamRole.DEVELOPER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(103)).description("Beskrivelse 4").roles(List.of(TeamRole.DEVELOPER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(104)).roles(List.of(TeamRole.DEVELOPER)).build()
                ))
                .build();
    }

    private void write(byte[] spreadsheet) throws Exception {
        Path tempFile = Files.createTempFile("spreadsheet", ".xlsx");
//        Path tempFile = Paths.get("/Users/s143147/spreadsheet" + ((int) (Math.random() * 100)) + ".xlsx");
        Files.write(tempFile, spreadsheet);
        log.info("Written to {}", tempFile.toAbsolutePath());
    }
}