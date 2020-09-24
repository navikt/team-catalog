package no.nav.data.team.member;

import lombok.extern.slf4j.Slf4j;
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
@ExtendWith(MockitoExtension.class)
class MemberExportServiceTest {

    @Mock
    private TeamService teamService;
    @Mock
    private ProductAreaService productAreaService;
    @InjectMocks
    private MemberExportService memberExportService;

    @BeforeEach
    void setUp() {
        lenient().when(productAreaService.getAll()).thenReturn(List.of(createPa(1), createPa(2), createPa(3)));
        lenient().when(productAreaService.get(any())).thenReturn(createPa(1));
        lenient().when(teamService.getAll()).thenReturn(List.of(createTeam(1), createTeam(2), createTeam(3)));
        lenient().when(teamService.get(any())).thenReturn(createTeam(1));
        NomMock.init();
    }

    @Test
    void getAll() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.ALL, null);
        assertThat(spreadsheet).isNotNull();
        write(spreadsheet);
    }

    @Test
    void getPa() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.PRODUCT_AREA, UUID.randomUUID().toString());
        assertThat(spreadsheet).isNotNull();
        write(spreadsheet);
    }

    @Test
    void getTeam() throws Exception {
        var spreadsheet = memberExportService.generateSpreadsheet(SpreadsheetType.TEAM, UUID.randomUUID().toString());
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
                .id(UUID.fromString("de5af77c-54ab-4c72-bb34-cbb06277c445"))
                .name("Produktområde " + nr)
                .members(List.of(
                        PaMember.builder().navIdent(createNavIdent(0)).description("Beskrivelse 1").roles(List.of(TeamRole.LEAD, TeamRole.TESTER)).build(),
                        PaMember.builder().navIdent(createNavIdent(1)).description("Beskrivelse 2").roles(List.of(TeamRole.DEVELOPER)).build())
                )
                .build();
    }

    private Team createTeam(int nr) {
        return Team.builder()
                .name("Team " + nr)
                .productAreaId(nr > 1 ? UUID.fromString("de5af77c-54ab-4c72-bb34-cbb06277c445") : null)
                .members(List.of(
                        TeamMember.builder().navIdent(createNavIdent(0)).description("Beskrivelse 1").roles(List.of(TeamRole.LEAD, TeamRole.TESTER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(1)).description("Beskrivelse 2").roles(List.of(TeamRole.DEVELOPER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(2)).description("Beskrivelse 3").roles(List.of(TeamRole.DEVELOPER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(3)).description("Beskrivelse 4").roles(List.of(TeamRole.DEVELOPER)).build(),
                        TeamMember.builder().navIdent(createNavIdent(4)).roles(List.of(TeamRole.DEVELOPER)).build()
                ))
                .build();
    }

    private void write(byte[] spreadsheet) throws Exception {
        Path tempFile = Files.createTempFile("spreadsheet", ".xlsx");
//        Path tempFile = Paths.get("/Users/s143147/spreadsheet.xlsx");
        Files.write(tempFile, spreadsheet);
        log.info("Written to {}", tempFile.toAbsolutePath());
    }
}