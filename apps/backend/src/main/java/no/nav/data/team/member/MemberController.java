package no.nav.data.team.member;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.TeamCatalogProps;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.dto.ClusterResponse;
import no.nav.data.team.member.MemberExportService.SpreadsheetType;
import no.nav.data.team.member.dto.MembershipResponse;
import no.nav.data.team.po.ProductAreaService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.resource.NomClient;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Objects.isNull;
import static no.nav.data.common.export.ExcelBuilder.SPREADSHEETML_SHEET_MIME;
import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/member")
@Tag(name = "Member", description = "Member endpoint")
public class MemberController {

    private final ResourceRepository resourceRepository;
    private final MemberExportService memberExportService;
    private final TeamCatalogProps teamCatalogProps;
    private final NomGraphClient nomGraphClient;
    private final ProductAreaService productAreaService;
    private final NomClient nomClient;

    public MemberController(ResourceRepository resourceRepository,
                            MemberExportService memberExportService,
                            TeamCatalogProps teamCatalogProps,
                            NomGraphClient nomGraphClient,
                            ProductAreaService productAreaService, NomClient nomClient) {
        this.resourceRepository = resourceRepository;
        this.memberExportService = memberExportService;
        this.teamCatalogProps = teamCatalogProps;
        this.nomGraphClient = nomGraphClient;
        this.productAreaService = productAreaService;
        this.nomClient = nomClient;
    }

    @Operation(summary = "Get Membership")
    @ApiResponse(description = "ok")
    @GetMapping("/membership/{id}")
    public ResponseEntity<MembershipResponse> getMembership(@PathVariable String id) {
        log.info("Get memberships for navident {}",id);
        var memberships = resourceRepository.findByMemberIdent(id);
        return ResponseEntity.ok(new MembershipResponse(
                convert(memberships.teams(), Team::convertToResponse),
                convert(memberships.productAreas(), this::convertProductAreaToReponse),
                convert(memberships.clusters(), Cluster::convertToResponse)
        ));
    }

    @Operation(summary = "Get Membership basert på ressurs sin epost")
    @ApiResponse(description = "ok")
    @GetMapping("/membership/byUserEmail")
    public ResponseEntity<MembershipResponse> getMembershipForUserByEmail(@RequestParam String email) {
        log.info("Get memberships for bruker med epost {}", email);
        var user = nomClient.getByEmail(email);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return getMembership(user.get().getNavIdent());
    }


    @Operation(summary = "Get Memberships")
    @ApiResponse(description = "ok")
    @PostMapping("/memberships")
    public ResponseEntity<Map<String, MembershipResponse>> getAllMemberships(@RequestBody List<String> navidenter) {
        var memberships = resourceRepository.findAllByMemberIdents(navidenter);
        Map<String, MembershipResponse> membershipResponseMap = memberships.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey, membership -> new MembershipResponse(
                                convert(membership.getValue().teams(), Team::convertToResponse),
                                convert(membership.getValue().productAreas(), this::convertProductAreaToReponse),
                                convert(membership.getValue().clusters(), Cluster::convertToResponse))));

        Map<UUID, Map<String, String>> productAreaToAvdelingMap = membershipResponseMap.values().stream()
                .flatMap(membership -> {
                    var clusterPAs = membership.getClusters().stream()
                            .map(ClusterResponse::getProductAreaId)
                            .filter(Objects::nonNull);
                    var teamPAs = membership.getTeams().stream()
                            .map(TeamResponse::getProductAreaId)
                            .filter(Objects::nonNull);
                    var paPAs = membership.getProductAreas().stream()
                            .map(ProductAreaResponse::getId)
                            .filter(Objects::nonNull);
                    return Stream.of(clusterPAs, teamPAs, paPAs).flatMap(s -> s);
                })
                .distinct()
                .map(productAreaService::get)
                .filter(Objects::nonNull)
                .filter(pa -> pa.getAvdelingNomId() != null)
                .collect(Collectors.toMap(
                        ProductArea::getId,
                        pa -> {
                            var orgEnhet = nomGraphClient.getOrgEnhet(pa.getAvdelingNomId());
                            return orgEnhet.map(oe -> Map.of(
                                    "avdelingNomId", oe.getId(),
                                    "avdelingNavn", oe.getNavn()
                            )).orElse(Map.of());
                        },
                        (existing, replacement) -> existing
                ));
        membershipResponseMap.values().forEach(response -> {
            log.info("Getting clusters");
            response.getClusters().forEach(cluster -> {
                var productAreaId = cluster.getProductAreaId();
                if (isNull(productAreaId)) return;
                var nomAvdeling = productAreaToAvdelingMap.getOrDefault(productAreaId, Map.of());
                var avdelingNomId = nomAvdeling.get("avdelingNomId");
                var avdelingNavn = nomAvdeling.get("avdelingNavn");
                cluster.setAvdelingNavn(avdelingNavn);
                cluster.setAvdelingNomId(avdelingNomId);
            });
            log.info("Getting teams");
            response.getTeams().forEach(team -> {
                var productAreaId = team.getProductAreaId();
                if (isNull(team.getProductAreaId())) return;
                var nomAvdeling = productAreaToAvdelingMap.getOrDefault(productAreaId, Map.of());
                var avdelingNomId = nomAvdeling.get("avdelingNomId");
                var avdelingNavn = nomAvdeling.get("avdelingNavn");
                team.setAvdelingNomId(avdelingNomId);
                team.setAvdelingNavn(avdelingNavn);
            });
            log.info("Getting productAreas");
            response.getProductAreas().forEach(productArea -> {
                log.info("Found product area {}", productArea);
                var nomAvdeling = productAreaToAvdelingMap.getOrDefault(productArea.getId(), Map.of());
                productArea.setAvdelingNavn(nomAvdeling.get("avdelingNavn"));
            });
        });
        return ResponseEntity.ok(membershipResponseMap);
    }

    @Operation(summary = "Get export for members")
    @ApiResponse(description = "Doc fetched", content = @Content(schema = @Schema(implementation = byte[].class)))
    @Transactional(readOnly = true)
    @GetMapping(value = "/export/{type}", produces = SPREADSHEETML_SHEET_MIME)
    public void getExport(
            HttpServletResponse response,
            @PathVariable("type") SpreadsheetType type,
            @RequestParam(name = "id", required = false) String id
    ) {
        log.info("Export spreadsheet {}, {}", type, id);
        if (type != SpreadsheetType.ALL && id == null) {
            throw new ValidationException("missing id for spreadsheet type " + type);
        }
        byte[] doc = memberExportService.generateSpreadsheet(type, id);
        String filename = "resources_" + type + Optional.ofNullable(id).map(s -> "_" + s).orElse("") + ".xlsx";
        response.setContentType(SPREADSHEETML_SHEET_MIME);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        writeDoc(response, doc);
    }

    private void writeDoc(HttpServletResponse response, byte[] doc) {
        try {
            StreamUtils.copy(doc, response.getOutputStream());
            response.flushBuffer();
        } catch (Exception e) {
            throw new TechnicalException("io error", e);
        }
    }

    private ProductAreaResponse convertProductAreaToReponse(ProductArea pa){
        return pa.convertToResponse(teamCatalogProps.getDefaultProductareaUuid());
    }


}
