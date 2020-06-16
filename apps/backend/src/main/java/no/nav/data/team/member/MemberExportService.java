package no.nav.data.team.member;

import no.nav.data.team.common.export.ExcelBuilder;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.member.MemberExportService.Member.Relation;
import no.nav.data.team.member.dto.MemberResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamRole;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static java.util.Comparator.comparing;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static no.nav.data.team.common.utils.StreamUtils.convert;

@Service
public class MemberExportService {

    public enum SpreadsheetType {
        ALL,
        PRODUCT_AREA,
        TEAM
    }

    private final TeamService teamService;
    private final ProductAreaService productAreaService;

    public MemberExportService(TeamService teamService, ProductAreaService productAreaService) {
        this.teamService = teamService;
        this.productAreaService = productAreaService;
    }

    public byte[] generateSpreadsheet(SpreadsheetType type, UUID id) {
        var pas = productAreaService.getAll();
        var members = switch (type) {
            case ALL -> getAll(pas);
            case PRODUCT_AREA -> getForProductArea(id, pas);
            case TEAM -> mapTeamMembers(List.of(teamService.get(id)), pas).collect(toList());
        };

        return generateFor(members);
    }

    private List<Member> getAll(List<ProductArea> pas) {
        return Stream.concat(
                mapTeamMembers(teamService.getAll(), pas),
                mapPaMembers(pas)
        ).collect(toList());
    }

    private List<Member> getForProductArea(UUID id, List<ProductArea> pas) {
        return Stream.concat(
                mapPaMembers(List.of(productAreaService.get(id))),
                mapTeamMembers(teamService.findByProductArea(id), pas)
        ).collect(toList());
    }

    private Stream<Member> mapPaMembers(List<ProductArea> productAreas) {
        return productAreas.stream().flatMap(pa -> pa.getMembers().stream().map(m -> new Member(Relation.PA, m.convertToResponse(), null, pa)));
    }

    private Stream<Member> mapTeamMembers(List<Team> teams, List<ProductArea> pas) {
        return teams.stream().flatMap(t -> t.getMembers().stream().map(m -> {
            ProductArea productArea = t.getProductAreaId() != null ? StreamUtils.find(pas, pa -> pa.getId().toString().equals(t.getProductAreaId())) : null;
            return new Member(Relation.TEAM, m.convertToResponse(), t, productArea);
        }));
    }

    private byte[] generateFor(List<Member> members) {
        var doc = new ExcelBuilder("Medlemmer");
        doc.addRow()
                .addCell("Tilknyttning")
                .addCell("Område")
                .addCell("Team")
                .addCell("Ident")
                .addCell("Fornavn")
                .addCell("Etternavn")
                .addCell("Type")
                .addCell("Roller")
                .addCell("Annet");

        Comparator<Member> c1 = comparing(m -> ofNullable(m.member.getResource().getFamilyName()).orElse(""));
        Comparator<Member> c2 = c1.thenComparing(m -> ofNullable(m.member.getResource().getGivenName()).orElse(""));
        members.sort(c2);
        members.forEach(m -> add(doc, m));

        return doc.build();
    }

    private void add(ExcelBuilder doc, Member member) {
        doc.addRow()
                .addCell(member.relationType())
                .addCell(member.productAreaName())
                .addCell(member.teamName())
                .addCell(member.member.getNavIdent())
                .addCell(member.member.getResource().getGivenName())
                .addCell(member.member.getResource().getFamilyName())
                .addCell(member.memberType())
                .addCell(member.roles())
                .addCell(member.member.getDescription());
    }

    record Member(Relation relation, MemberResponse member, Team team, ProductArea pa) {

        enum Relation {
            TEAM,
            PA
        }

        public String relationType() {
            return switch (relation) {
                case TEAM -> "Team";
                case PA -> "Område";
            };
        }

        public String productAreaName() {
            return switch (relation) {
                case TEAM -> pa != null ? pa.getName() : "";
                case PA -> pa.getName();
            };
        }

        public String teamName() {
            return switch (relation) {
                case TEAM -> team.getName();
                case PA -> "";
            };
        }

        public String memberType() {
            if (member.getResource().getResourceType() == null) {
                return "";
            }
            return switch (member.getResource().getResourceType()) {
                case INTERNAL -> "Intern";
                case EXTERNAL -> "Ekstern";
            };
        }

        public String roles() {
            return String.join(", ", convert(member.getRoles(), this::roleName));
        }

        private String roleName(TeamRole role) {
            return switch (role) {
                case LEAD -> "Teamleder";
                case DEVELOPER -> "Utvikler";
                case TESTER -> "Tester";
                case TECH_LEAD -> "Tech lead";
                case TEST_LEAD -> "Testleder";
                case PRODUCT_OWNER -> "Produkteier";
                case SECURITY_ARCHITECT -> "Sikkerhetsarkitekt";
                case SOLUTION_ARCHITECT -> "Løsningsarkitetkt";
                case BUSINESS_ANALYST -> "Forretningsutvikler";
                case DOMAIN_EXPERT -> "Domeneekspert";
                case DOMAIN_RESPONSIBLE -> "Fagansvarlig";
                case DOMAIN_RESOURCE -> "Fagressurs";
                case ARCHITECT -> "Arkitekt";
                case AGILE_COACH -> "Agile coach";
                case DATA_MANAGER -> "Data manager";
                case DATA_SCIENTIST -> "Data scientist";
                case MAINTENANCE_MANAGER -> "Vedlikeholdsansvarlig";
                case DESIGNER -> "Designer";
                case OPERATIONS -> "Drift";
                case FUNCTIONAL_ADVISER -> "Funksjonell rådgiver";
                case TECHNICAL_ADVISER -> "Teknisk rådgiver";
                case TECHNICAL_TESTER -> "Teknisk tester";
                case OTHER -> "Annet";
            };
        }
    }

}
