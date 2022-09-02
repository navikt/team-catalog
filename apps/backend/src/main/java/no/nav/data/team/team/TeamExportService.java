package no.nav.data.team.team;

import no.nav.data.common.export.ExcelBuilder;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.domain.ResourceType;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.team.domain.OfficeHours;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.data.team.team.domain.TeamRole;
import org.springframework.stereotype.Service;

import java.util.Arrays;
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
        AREA
    }

    private final TeamService teamService;
    private final ProductAreaService productAreaService;
    private final ClusterService clusterService;
    private final NomClient nomClient = NomClient.getInstance();

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
            case AREA -> teamService.findByProductArea(filterUuid);
        };

        var teams = convert(domainTeams, t -> new TeamInfo(t, domainPaMap.get(t.getProductAreaId()), convert(t.getClusterIds(), domainClusterMap::get)));

        return generate(teams);
    }

    private byte[] generate(List<TeamInfo> teams) {
        var doc = new ExcelBuilder("Teams");

        doc.addRow()
                .addCell(Lang.TEAM_ID)
                .addCell(Lang.NAME)
                .addCell(Lang.TEAM_LEADS)
                .addCell(Lang.PRODUCT_OWNERS)
                .addCell(Lang.OWNERSHIP_TYPE)
                .addCell(Lang.TEAM_TYPE)
                .addCell(Lang.AREA_ID)
                .addCell(Lang.AREA)
                .addCell(Lang.CLUSTER)
                .addCell(Lang.STATUS)
                .addCell(Lang.QA_DONE)
                .addCell(Lang.NAIS_TEAMS)
                .addCell(Lang.TAGS)
                .addCell(Lang.MEMBERS)
                .addCell(Lang.INTERNAL)
                .addCell(Lang.EXTERNAL)
                .addCell(Lang.SLACK)

                .addCell((Lang.CONTACT_PERSON))
                .addCell(Lang.LOCATION)
                .addCell(Lang.OFFICE_HOURS)

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
                .addCell(team.getId().toString())
                .addCell(team.getName())
                .addCell(names(members, TeamRole.LEAD))
                .addCell(names(members, TeamRole.PRODUCT_OWNER))
                .addCell(Lang.teamOwnershipType(team.getTeamOwnershipType()))
                .addCell(Lang.teamType(team.getTeamType()))
                .addCell(ofNullable(team.getProductAreaId()).map(UUID::toString).orElse(""))
                .addCell(ofNullable(teamInfo.productArea()).map(ProductArea::getName).orElse(""))
                .addCell(safeStream(teamInfo.clusters()).map(Cluster::getName).collect(Collectors.joining(", ")))
                .addCell(team.getStatus().toString())
                .addCell(DateUtil.formatDateTimeHumanReadable(team.getQaTime()))
                .addCell(join(", ", nullToEmptyList(team.getNaisTeams())))
                .addCell(join(", ", nullToEmptyList(team.getTags())))
                .addCell(members.size())
                .addCell(filter(members, m -> m.getResource().getResourceType() == ResourceType.INTERNAL).size())
                .addCell(filter(members, m -> m.getResource().getResourceType() == ResourceType.EXTERNAL).size())
                .addCell(team.getSlackChannel())
                .addCell(contactPerson(team.getContactPersonIdent()))
                .addCell(location(team.getOfficeHours()))
                .addCell(officeHours(team.getOfficeHours()))
                .addCell(team.getDescription())


        ;
    }

    private String names(List<MemberResponse> members, TeamRole role) {
        return filter(members, m -> m.getRoles().contains(role)).stream()
                .map(MemberResponse::getResource).map(r -> r.getFamilyName() + ", " + r.getGivenName()).collect(Collectors.joining(" - "));
    }

    private String contactPerson(String ident ) {
        if(ident == null){
            return "";
        }
        var nameOptional = nomClient.getNameForIdent(ident);

        if(nameOptional.isPresent()){
            var stringName = nameOptional.get();
            var splitName = stringName.split(" ");
            return splitName[splitName.length-1] + ", " + String.join(" ", Arrays.copyOf(splitName, splitName.length-1));
        }
        return "";
    }

    private String location(OfficeHours officeHours){
        if(officeHours == null){
            return "";
        }

        return officeHours.getLocationCode();
    }

    private String officeHours(OfficeHours officeHours){
        if(officeHours == null){
            return "";
        }

        var days = officeHours.getDays().toString();

        // Removing the "[" at the start of the variable and the "]" at the end of the variable
        days = days.substring(1, days.length() - 1);

        return days;
    }

    record TeamInfo(Team team, ProductArea productArea, List<Cluster> clusters) {

    }

    private UUID toUUID(String uuid) {
        return uuid == null ? null : UUID.fromString(uuid);
    }
}
