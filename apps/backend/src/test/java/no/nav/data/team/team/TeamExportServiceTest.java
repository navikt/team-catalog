package no.nav.data.team.team;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
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
import java.nio.file.Paths;
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
    @InjectMocks
    private TeamExportService service;

    ProductArea pa1 = ProductArea.builder().id(UUID.randomUUID()).name("Pa 1").build();
    ProductArea pa2 = ProductArea.builder().id(UUID.randomUUID()).name("Pa 2").build();

    @BeforeEach
    void setUp() {
        NomMock.init();
    }

    @Test
    void testAllTeams() {
        when(productAreaService.getAll()).thenReturn(List.of(pa1, pa2));
        when(teamService.getAll()).thenReturn(List.of(
                createTeam(null, TeamRole.LEAD, TeamRole.PRODUCT_OWNER),
                createTeam(pa1.getId().toString(), TeamRole.LEAD),
                createTeam(pa2.getId().toString(), TeamRole.PRODUCT_OWNER)
        ));

        var doc = service.generate(SpreadsheetType.ALL, null);
        assertThat(doc).isNotEmpty();
        write(doc);
    }

    @Test
    void testProductAreaTeams() {
        when(productAreaService.get(pa1.getId())).thenReturn(pa1);
        when(teamService.findByProductArea(pa1.getId())).thenReturn(List.of(createTeam(pa1.getId().toString(), TeamRole.LEAD)));

        var doc = service.generate(SpreadsheetType.PRODUCT_AREA, pa1.getId().toString());
        assertThat(doc).isNotEmpty();
        write(doc);
    }

    private Team createTeam(String productAreaId, TeamRole... roles) {
        var i = new AtomicInteger(0);
        return Team.builder()
                .name("name")
                .teamType(TeamType.IT)
                .description("desc")
                .slackChannel("#channel")
                .naisTeams(List.of("nais-team-1", "nais-team-2"))
                .productAreaId(productAreaId)
                .tags(List.of("tag"))
                .members(Arrays.stream(roles)
                        .map(r -> TeamMember.builder()
                                .navIdent(createNavIdent(i.getAndIncrement()))
                                .roles(List.of(r, TeamRole.DOMAIN_RESOURCE))
                                .build())
                        .collect(Collectors.toList())
                ).build();
    }

    @SneakyThrows
    private void write(byte[] spreadsheet) {
//        Path tempFile = Files.createTempFile("spreadsheet", ".xlsx");
        Path tempFile = Paths.get("/Users/s143147/spreadsheet.xlsx");
        Files.write(tempFile, spreadsheet);
        log.info("Written to {}", tempFile.toAbsolutePath());
    }
}
