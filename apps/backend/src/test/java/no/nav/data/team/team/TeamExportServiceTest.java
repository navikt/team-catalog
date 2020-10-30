package no.nav.data.team.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomMock;
import no.nav.data.team.team.TeamExportService.SpreadsheetType;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static no.nav.data.team.TestDataHelper.createNavIdent;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@Slf4j
@ExtendWith(MockitoExtension.class)
class TeamExportServiceTest {

    @Mock
    private TeamService teamService;
    @Mock
    private ProductAreaService productAreaService;
    @Mock
    private ClusterService clusterService;
    @InjectMocks
    private TeamExportService service;

    ProductArea pa1 = ProductArea.builder().id(UUID.randomUUID()).name("Pa 1").build();
    ProductArea pa2 = ProductArea.builder().id(UUID.randomUUID()).name("Pa 2").build();
    Cluster cl1 = Cluster.builder().id(UUID.randomUUID()).name("Cl 1").build();
    Cluster cl2 = Cluster.builder().id(UUID.randomUUID()).name("Cl 2").build();

    @BeforeEach
    void setUp() {
        NomMock.init();
    }

    @Test
    void testAllTeams() throws Exception {
        when(productAreaService.getAll()).thenReturn(List.of(pa1, pa2));
        when(clusterService.getAll()).thenReturn(List.of(cl1, cl2));
        when(teamService.getAll()).thenReturn(List.of(
                createTeam(null, null, TeamRole.LEAD, TeamRole.PRODUCT_OWNER),
                createTeam(pa1.getId(), cl1.getId(), TeamRole.LEAD),
                createTeam(pa2.getId(), cl2.getId(), TeamRole.PRODUCT_OWNER)
        ));

        var doc = service.generate(SpreadsheetType.ALL, null);
        assertThat(doc).isNotEmpty();
        write(doc);
    }

    @Test
    void testProductAreaTeams() throws Exception {
        when(productAreaService.getAll()).thenReturn(List.of(pa1));
        when(teamService.findByProductArea(pa1.getId())).thenReturn(List.of(createTeam(pa1.getId(), null, TeamRole.LEAD)));

        var doc = service.generate(SpreadsheetType.PRODUCT_AREA, pa1.getId().toString());
        assertThat(doc).isNotEmpty();
        write(doc);
    }

    @Test
    void testClusterTeams() throws Exception {
        when(clusterService.getAll()).thenReturn(List.of(cl1));
        when(teamService.findByCluster(cl1.getId())).thenReturn(List.of(createTeam(null, cl1.getId(), TeamRole.LEAD)));

        var doc = service.generate(SpreadsheetType.CLUSTER, cl1.getId().toString());
        assertThat(doc).isNotEmpty();
        write(doc);
    }

    private Team createTeam(UUID productAreaId, UUID clusterId, TeamRole... roles) {
        var i = new AtomicInteger(0);
        return Team.builder()
                .name("name")
                .teamType(TeamType.IT)
                .description("desc")
                .slackChannel("#channel")
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .productAreaId(productAreaId)
                .tags(List.of("tag"))
                .clusterIds(clusterId != null ? List.of(clusterId) : null)
                .qaTime(LocalDateTime.now())
                .members(Arrays.stream(roles)
                        .map(r -> TeamMember.builder()
                                .navIdent(createNavIdent(i.getAndIncrement()))
                                .roles(List.of(r, TeamRole.DOMAIN_RESOURCE))
                                .build())
                        .collect(Collectors.toList())
                ).build();
    }

    private void write(byte[] spreadsheet) throws Exception {
        Path tempFile = Files.createTempFile("spreadsheet", ".xlsx");
//        Path tempFile = java.nio.file.Paths.get("/Users/s143147/spreadsheet.xlsx");
        Files.write(tempFile, spreadsheet);
        log.info("Written to {}", tempFile.toAbsolutePath());
    }
}
