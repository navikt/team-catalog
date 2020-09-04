package no.nav.data.team.team;

import no.nav.data.common.export.ExcelBuilder;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.lang.String.join;
import static java.util.Optional.ofNullable;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.nullToEmptyList;

@Service
public class TeamExportService {

    public enum SpreadsheetType {
        ALL,
        PRODUCT_AREA
    }

    private final TeamService teamService;
    private final ProductAreaService productAreaService;

    public TeamExportService(TeamService teamService, ProductAreaService productAreaService) {
        this.teamService = teamService;
        this.productAreaService = productAreaService;
    }

    public byte[] generate(SpreadsheetType type, String filter) {
        UUID productAreaId = toUUID(filter);
        var domainProductAreas = type == SpreadsheetType.ALL ? productAreaService.getAll() : List.of(productAreaService.get(productAreaId));
        var domainPaMap = domainProductAreas.stream().collect(Collectors.toMap(ProductArea::getId, Function.identity()));
        var domainTeams = type == SpreadsheetType.ALL ? teamService.getAll() : teamService.findByProductArea(productAreaId);

        var teams = mapTeamInfo(domainTeams, domainPaMap);

        return generate(teams);
    }

    private List<TeamInfo> mapTeamInfo(List<Team> teams, Map<UUID, ProductArea> pas) {
        return convert(teams, t -> new TeamInfo(t, pas.get(toUUID(t.getProductAreaId())), getMembers(t, TeamRole.LEAD), getMembers(t, TeamRole.PRODUCT_OWNER)));
    }

    private List<MemberResponse> getMembers(Team t, TeamRole role) {
        return t.getMembers().stream()
                .filter(m -> m.getRoles().contains(role))
                .map(TeamMember::convertToResponse)
                .collect(Collectors.toList());
    }

    private byte[] generate(List<TeamInfo> teams) {
        var doc = new ExcelBuilder("Teams");

        doc.addRow()
                .addCell("Navn")
                .addCell("Type")
                .addCell("Beskrivelse")
                .addCell("Område")
                .addCell("Slack")
                .addCell("Kvalitetssikret")
                .addCell("Nais teams")
                .addCell("Tags")
                .addCell("Teamledere")
                .addCell("Produkteiere")
        ;

        teams.sort(Comparator.comparing(t -> t.team().getName()));
        teams.forEach(t -> add(doc, t));

        return doc.build();
    }

    private void add(ExcelBuilder doc, TeamInfo teamInfo) {
        var team = teamInfo.team();
        doc.addRow()
                .addCell(team.getName())
                .addCell(teamType(team.getTeamType()))
                .addCell(team.getDescription())
                .addCell(ofNullable(teamInfo.productArea()).map(ProductArea::getName).orElse(""))
                .addCell(team.getSlackChannel())
                .addCell(BooleanUtils.toString(team.isTeamLeadQA(), "Ja", "Nei"))
                .addCell(join(", ", nullToEmptyList(team.getNaisTeams())))
                .addCell(join(", ", nullToEmptyList(team.getTags())))
                .addCell(join(", ", convert(teamInfo.teamLeaders(), m -> m.getResource().getFullName())))
                .addCell(join(", ", convert(teamInfo.productOwners(), m -> m.getResource().getFamilyName())))
        ;
    }

    private String teamType(TeamType teamType) {
        if (teamType == null) {
            return "";
        }
        return switch (teamType) {
            case IT -> "IT-team";
            case PRODUCT -> "Produktteam";
            case ADMINISTRATION -> "Forvaltningsteam";
            case PROJECT -> "Prosjektteam";
            case OTHER -> "Annet";
            case UNKNOWN -> "Ukjent";
        };
    }

    record TeamInfo(Team team, ProductArea productArea,
                    List<MemberResponse> teamLeaders, List<MemberResponse> productOwners
    ) {

    }

    private UUID toUUID(String uuid) {
        return uuid == null ? null : UUID.fromString(uuid);
    }
}
