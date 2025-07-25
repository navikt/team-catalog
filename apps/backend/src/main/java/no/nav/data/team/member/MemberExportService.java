package no.nav.data.team.member;

import lombok.RequiredArgsConstructor;
import no.nav.data.common.export.ExcelBuilder;
import no.nav.data.common.utils.DateUtil;
import no.nav.data.common.utils.StreamUtils;
import no.nav.data.common.utils.StringUtils;
import no.nav.data.team.cluster.ClusterService;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.domain.ClusterMember;
import no.nav.data.team.member.MemberExportService.Member.Relation;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.AreaType;
import no.nav.data.team.po.domain.PaMember;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.data.team.shared.Lang;
import no.nav.data.team.shared.domain.Membered;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamMember;
import no.nav.nom.graphql.model.RessursOrgTilknytningDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Comparator.comparing;
import static java.util.Objects.isNull;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.utils.StreamUtils.tryFind;
import static no.nav.data.team.shared.Lang.NOM_ID_NOT_APPLICABLE;
import static org.apache.commons.lang3.StringUtils.EMPTY;

@Service
@RequiredArgsConstructor
public class MemberExportService {

    public enum SpreadsheetType {
        ALL,
        AREA,
        CLUSTER,
        TEAM,
        ROLE,
        LEADER
    }

    private final TeamService teamService;
    private final ProductAreaService productAreaService;
    private final ClusterService clusterService;
    private final NomGraphClient nomGraphClient;

    public byte[] generateSpreadsheet(SpreadsheetType type, String filter) {
        var pas = productAreaService.getAll();
        var clusters = clusterService.getAll();
        var members = switch (type) {
            case ALL -> getAll(pas, clusters);
            case AREA -> getForProductArea(StringUtils.toUUID(filter), pas, clusters);
            case CLUSTER -> getForCluster(StringUtils.toUUID(filter), pas, clusters);
            case TEAM -> mapTeamMembers(List.of(teamService.get(StringUtils.toUUID(filter))), pas, clusters).collect(toList());
            case ROLE -> filter(getAll(pas, clusters), m -> convert(m.member().getRoles(), Enum::name).contains(filter));
            case LEADER -> filter(getAll(pas, clusters), m -> {
                var leaderMembers = nomGraphClient.getLeaderMembersActiveOnly(filter);
                return leaderMembers.contains(m.member().getNavIdent());
            });
        };
        return generateFor(members);
    }

    private List<Member> getAll(List<ProductArea> pas, List<Cluster> clusters) {
        var allActiveTeams = teamService.getAll().stream().filter(it -> {
            var status = it.getStatus();
            return status != null && status.isActive();
        }).toList();
        return Stream.concat(
                Stream.concat(
                        mapTeamMembers(allActiveTeams, pas, clusters),
                        mapPaMembers(pas)
                ),
                mapClusterMembers(clusters, pas)
        ).collect(toList());
    }

    private List<Member> getForProductArea(UUID id, List<ProductArea> pas, List<Cluster> clusters) {
        ProductArea productArea = productAreaService.get(id);
        return Stream.concat(Stream.concat(
                mapPaMembers(List.of(productArea)),
                mapTeamMembers(teamService.findByProductArea(id).stream().filter(team -> team.getStatus().isActive()).toList(), pas, clusters))
                , mapClusterMembers(filter(clusters, cl -> productArea.getId().equals(cl.getProductAreaId())), pas)
        ).collect(toList());
    }

    private List<Member> getForCluster(UUID id, List<ProductArea> pas, List<Cluster> clusters) {
        return Stream.concat(
                mapClusterMembers(List.of(clusterService.get(id)), pas),
                mapTeamMembers(teamService.findByCluster(id), pas, clusters)
        ).collect(toList());
    }

    private Stream<Member> mapPaMembers(List<ProductArea> productAreas) {
        var members = productAreas.stream()
                .map(ProductArea::getMembers)
                .flatMap(List::stream)
                .map(PaMember::getNavIdent)
                .distinct().toList();
        var otMap = getOrgtilknytningMap(members);

        return productAreas.stream().flatMap(pa ->
                pa.getMembers().stream().map(m ->
                        new Member(Relation.PA, m.convertToResponse(), otMap.getOrDefault(m.getNavIdent(), new Member.Orgenhet()), null, pa, List.of())
                )
        );
    }

    private Stream<Member> mapClusterMembers(List<Cluster> clusters, List<ProductArea> productAreas) {
        var navidenter = clusters.stream()
                .flatMap(cluster -> cluster.getMembers().stream())
                .map(ClusterMember::getNavIdent)
                .distinct()
                .toList();

        var otMap = getOrgtilknytningMap(navidenter);

        return clusters.stream().flatMap(cluster ->
                cluster.getMembers().stream().map(m ->
                        new Member(Relation.CLUSTER, m.convertToResponse(), otMap.getOrDefault(m.getNavIdent(), new Member.Orgenhet()),null,
                                tryFind(productAreas, pa -> pa.getId().equals(cluster.getProductAreaId())).orElse(null),
                                List.of(cluster)
                        )
                )
        );
    }

    private Stream<Member> mapTeamMembers(List<Team> teams, List<ProductArea> pas, List<Cluster> clusters) {
        var navidenter = teams.stream()
                .flatMap(t -> t.getMembers().stream())
                .map(TeamMember::getNavIdent)
                .distinct()
                .toList();
        var otMap = getOrgtilknytningMap(navidenter);

        return teams.stream().flatMap(t -> t.getMembers().stream().map(m -> {
            ProductArea productArea = t.getProductAreaId() != null ? StreamUtils.find(pas, pa -> pa.getId().equals(t.getProductAreaId())) : null;
            List<Cluster> clustersForTeam = filter(clusters, cluster -> t.getClusterIds().contains(cluster.getId()));
            return new Member(Relation.TEAM, m.convertToResponse(), otMap.getOrDefault(m.getNavIdent(), new Member.Orgenhet()), t, productArea, clustersForTeam);
        }));
    }

    private Map<String, Member.Orgenhet> getOrgtilknytningMap(List<String> navidenter) {
        return nomGraphClient.getRessurser(navidenter).entrySet().stream().collect(
                Collectors.toMap(Map.Entry::getKey, e -> e.getValue().getOrgTilknytning()
                        .stream().sorted(Comparator.comparing(RessursOrgTilknytningDto::getGyldigFom))
                        .filter(ot ->
                                ot.getErDagligOppfolging()
                                && (ot.getGyldigTom() == null || ot.getGyldigTom().isAfter(LocalDate.now())))
                        .findFirst()
                        .map(ot ->
                                new Member.Orgenhet(
                                        ot.getOrgEnhet().getId(),
                                        ot.getOrgEnhet().getNavn(),
                                        ot.getOrgEnhet().getLeder().stream().findFirst().map(leder -> leder.getRessurs().getVisningsnavn()).orElse(""),
                                        ot.getOrgEnhet().getLeder().stream().findFirst().map(leder -> leder.getRessurs().getNavident()).orElse(""))
                        ).orElse(new Member.Orgenhet())
                )
        );
    }

    private byte[] generateFor(List<Member> members) {
        var doc = new ExcelBuilder(Lang.MEMBERS);
        doc.addRow()
                .addCell(Lang.RELATION)
                .addCell(Lang.AREA_NOM_ID)
                .addCell(Lang.AREA)
                .addCell(Lang.CLUSTER)
                .addCell(Lang.TEAM)
                .addCell(Lang.IDENT)
                .addCell(Lang.GIVEN_NAME)
                .addCell(Lang.FAMILY_NAME)
                .addCell(Lang.RESOURCE_TYPE)
                .addCell(Lang.ROLES)
                .addCell(Lang.OTHER)
                .addCell(Lang.EMAIL)
                .addCell(Lang.START_DATE)
                .addCell(Lang.END_DATE)
                .addCell(Lang.ORGENHET_ID)
                .addCell(Lang.ORGENHET)
                .addCell(Lang.ORGENHET_LEDER)
                .addCell(Lang.ORGENHET_LEDER_NAVIDENT)
        ;

        Comparator<Member> c1 = comparing(m -> ofNullable(m.member.getResource().getFamilyName()).orElse(""));
        Comparator<Member> c2 = c1.thenComparing(m -> ofNullable(m.member.getResource().getGivenName()).orElse(""));
        members.sort(c2);
        members.forEach(m -> add(doc, m));

        return doc.build();
    }

    private void add(ExcelBuilder doc, Member member) {
        doc.addRow()
                .addCell(member.relationType())
                .addCell(member.productAreaNomId())
                .addCell(member.productAreaName())
                .addCell(member.clusterName())
                .addCell(member.teamName())
                .addCell(member.member.getNavIdent())
                .addCell(member.member.getResource().getGivenName())
                .addCell(member.member.getResource().getFamilyName())
                .addCell(member.memberType())
                .addCell(member.roles())
                .addCell(member.member.getDescription())
                .addCell(member.member.getResource().getEmail())
                .addCell(DateUtil.formatDate(member.member.getResource().getStartDate()))
                .addCell(shouldHideEndDateIfBeforeNow(member.member.getResource().getEndDate()))
                .addCell(member.orgenhet.id())
                .addCell(member.orgenhet.navn != null? String.format("%s", member.orgenhet.navn) : "")
                .addCell(member.orgenhet.leder)
                .addCell(member.orgenhet.lederNavident)
        ;
    }

    private String shouldHideEndDateIfBeforeNow(LocalDate endDate) {
        if (isNull(endDate) || endDate.isAfter(LocalDate.now())) return null;
        else return DateUtil.formatDate(endDate);
    }

    record Member(Relation relation, MemberResponse member, Orgenhet orgenhet, Team team, ProductArea pa, List<Cluster> clusters) {

        public String productAreaNomId() {
            if(pa != null){
                var nomId = pa.getNomId();
                if(nomId != null){
                    return pa.getNomId();
                }
                var isNomSeksjon = AreaType.PRODUCT_AREA.equals(pa.getAreaType());
                if(!isNomSeksjon){
                    return NOM_ID_NOT_APPLICABLE;
                }
            }
            return EMPTY;
        }

        enum Relation {
            TEAM(Team.class),
            PA(ProductArea.class),
            CLUSTER(Cluster.class);

            private final Class<? extends Membered> type;

            Relation(Class<? extends Membered> type) {
                this.type = type;
            }
        }

        public record Orgenhet(String id, String navn, String leder, String lederNavident) {

            public Orgenhet() {
                this(null, null , null, null);
            }
        }

        public String relationType() {
            return Lang.objectType(relation.type);
        }

        public String productAreaName() {
            return pa != null ? pa.getName() : EMPTY;
        }

        public String clusterName() {
            return clusters.isEmpty() ? EMPTY : String.join(", ", convert(clusters, Cluster::getName));
        }

        public String teamName() {
            return switch (relation) {
                case TEAM -> team.getName();
                case PA, CLUSTER -> EMPTY;
            };
        }

        public String memberType() {
            if (member.getResource().getResourceType() == null) {
                return EMPTY;
            }
            return Lang.memberType(member.getResource().getResourceType());
        }

        public String roles() {
            return String.join(", ", convert(member.getRoles(), Lang::roleName));
        }
    }
}
