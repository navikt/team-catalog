package no.nav.data.team.member;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.ValidationException;
import no.nav.data.team.member.MemberExportService.SpreadsheetType;
import no.nav.data.team.member.dto.MembershipResponse;
import no.nav.data.team.po.domain.ProductArea;
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
import javax.servlet.http.HttpServletResponse;

import static no.nav.data.team.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@RequestMapping("/member")
@Api(value = "Member endpoint", tags = "Member")
public class MemberController {

    private static final String SPREADSHEETML_SHEET = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final ResourceRepository resourceRepository;
    private final MemberExportService memberExportService;

    public MemberController(ResourceRepository resourceRepository, MemberExportService memberExportService) {
        this.resourceRepository = resourceRepository;
        this.memberExportService = memberExportService;
    }

    @ApiOperation("Get Memberships")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = MembershipResponse.class)
    })
    @GetMapping("/membership/{id}")
    public ResponseEntity<MembershipResponse> getAll(@PathVariable String id) {
        var memberships = resourceRepository.findByMemberIdent(id);
        return ResponseEntity.ok(new MembershipResponse(
                convert(memberships.teams(), Team::convertToResponse),
                convert(memberships.productAreas(), ProductArea::convertToResponse))
        );
    }

    @ApiOperation(value = "Get export for members")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Doc fetched", response = byte[].class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @Transactional(readOnly = true)
    @SneakyThrows
    @GetMapping(value = "/export/{type}", produces = SPREADSHEETML_SHEET)
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
        response.setContentType(SPREADSHEETML_SHEET);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        StreamUtils.copy(doc, response.getOutputStream());
        response.flushBuffer();
    }


}
