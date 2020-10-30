package no.nav.data.team.team;

import no.nav.data.common.export.ExcelBuilder;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
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
import static no.nav.data.common.utils.StreamUtils.safeStream;

@Service
public class TeamExportService {

    public enum SpreadsheetType {
        ALL,
        CLUSTER,
        PRODUCT_AREA
    }

    private final TeamService teamService;
    private final ProductAreaService productAreaService;
    private final ClusterService clusterService;

    public TeamExportService(TeamService teamService, ProductAreaService productAreaService, ClusterService clusterService) {
        this.teamService = teamService;
        this.productAreaService = productAreaService;
        this.clusterService = clusterService;
    }

    public byte[] generate(SpreadsheetType type, String filter) {
        UUID filterUuid = toUUID(filter);
        var domainPaMap = productAreaService.getAll().stream().collect(Collectors.toMap(ProductArea::getId, Function.identity()));
        var domainClusterMap = clusterService.getAll().stream().collect(Collectors.toMap(Cluster::getId, Function.identity()));
        var domainTeams = switch (type) {
            case ALL -> teamService.getAll();
            case CLUSTER -> teamService.findByCluster(filterUuid);
            case PRODUCT_AREA -> teamService.findByProductArea(filterUuid);
        };

        var teams = convert(domainTeams, t -> new TeamInfo(t, domainPaMap.get(t.getProductAreaId()), convert(t.getClusterIds(), domainClusterMap::get)));

        return generate(teams);
    }

    private byte[] generate(List<TeamInfo> teams) {
        var doc = new ExcelBuilder("Teams");

        doc.addRow()
                .addCell(Lang.NAME)
                .addCell(Lang.TEAM_LEADS)
                .addCell(Lang.PRODUCT_OWNERS)
                .addCell(Lang.TYPE)
                .addCell(Lang.PRODUCT_AREA)
                .addCell(Lang.CLUSTER)
                .addCell(Lang.QA_DONE)
                .addCell(Lang.NAIS_TEAMS)
                .addCell(Lang.TAGS)
                .addCell(Lang.MEMBERS)
                .addCell(Lang.INTERNAL)
                .addCell(Lang.EXTERNAL)
                .addCell(Lang.SLACK)
                .addCell(Lang.DESCRIPTION)
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
                .addCell(Lang.teamType(team.getTeamType()))
                .addCell(ofNullable(teamInfo.productArea()).map(ProductArea::getName).orElse(""))
                .addCell(safeStream(teamInfo.clusters()).map(Cluster::getName).collect(Collectors.joining(", ")))
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

    record TeamInfo(Team team, ProductArea productArea, List<Cluster> clusters) {

    }

    private UUID toUUID(String uuid) {
        return uuid == null ? null : UUID.fromString(uuid);
    }
}
