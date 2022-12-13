package no.nav.data.team.member;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import no.nav.data.common.TeamCatalogProps;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.member.MemberExportService.SpreadsheetType;
import no.nav.data.team.member.dto.MembershipResponse;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.ProductAreaResponse;
import no.nav.data.team.resource.domain.ResourceRepository;
import no.nav.data.team.team.domain.Team;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.function.Function;
import javax.servlet.http.HttpServletResponse;

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

    public MemberController(ResourceRepository resourceRepository, MemberExportService memberExportService, TeamCatalogProps teamCatalogProps) {
        this.resourceRepository = resourceRepository;
        this.memberExportService = memberExportService;
        this.teamCatalogProps = teamCatalogProps;
    }

    @Operation(summary = "Get Memberships")
    @ApiResponse(description = "ok")
    @GetMapping("/membership/{id}")
    public ResponseEntity<MembershipResponse> getAll(@PathVariable String id) {
        var memberships = resourceRepository.findByMemberIdent(id);
        return ResponseEntity.ok(new MembershipResponse(
                convert(memberships.teams(), Team::convertToResponse),
                convert(memberships.productAreas(), this::convertProductAreaToReponse),
                convert(memberships.clusters(), Cluster::convertToResponse)
        ));
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
