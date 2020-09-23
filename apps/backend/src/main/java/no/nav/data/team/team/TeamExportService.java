package no.nav.data.team.team;

import no.nav.data.common.export.ExcelBuilder;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.lang.String.join;
import static java.util.Optional.ofNullable;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
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

        var teams = convert(domainTeams, t -> new TeamInfo(t, domainPaMap.get(toUUID(t.getProductAreaId()))));

        return generate(teams);
    }

    private byte[] generate(List<TeamInfo> teams) {
        var doc = new ExcelBuilder("Teams");

        doc.addRow()
                .addCell("Navn")
                .addCell("Teamledere")
                .addCell("Produkteiere")
                .addCell("Type")
                .addCell("Område")
                .addCell("Kvalitetssikret")
                .addCell("Nais teams")
                .addCell("Tags")
                .addCell("Medlemmer")
                .addCell("Interne")
                .addCell("Eksterne")
                .addCell("Slack")
                .addCell("Beskrivelse")
        ;

        teams.sort(Comparator.comparing(t -> t.team().getName()));
        teams.forEach(t -> add(doc, t));

        return doc.build();
    }

    private void add(ExcelBuilder doc, TeamInfo teamInfo) {
        var team = teamInfo.team();
        var members = convert(team.getMembers(), TeamMember::convertToResponse);

        doc.addRow()
                .addCell(team.getName())
                .addCell(names(members, TeamRole.LEAD))
                .addCell(names(members, TeamRole.PRODUCT_OWNER))
                .addCell(teamType(team.getTeamType()))
                .addCell(ofNullable(teamInfo.productArea()).map(ProductArea::getName).orElse(""))
                .addCell(DateUtil.formatDateTimeHumanReadable(team.getQaTime()))
                .addCell(join(", ", nullToEmptyList(team.getNaisTeams())))
                .addCell(join(", ", nullToEmptyList(team.getTags())))
                .addCell(members.size())
                .addCell(filter(members, m -> m.getResource().getResourceType() == ResourceType.INTERNAL).size())
                .addCell(filter(members, m -> m.getResource().getResourceType() == ResourceType.EXTERNAL).size())
                .addCell(team.getSlackChannel())
                .addCell(team.getDescription())
        ;
    }

    private String names(List<MemberResponse> members, TeamRole role) {
        return filter(members, m -> m.getRoles().contains(role)).stream()
                .map(MemberResponse::getResource).map(r -> r.getFamilyName() + ", " + r.getGivenName()).collect(Collectors.joining(" - "));
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

    record TeamInfo(Team team, ProductArea productArea) {

    }

    private UUID toUUID(String uuid) {
        return uuid == null ? null : UUID.fromString(uuid);
    }
}
