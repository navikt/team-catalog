package no.nav.data.team.team;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.TeamCatalogProps;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.sync.SyncService;
import no.nav.data.team.team.TeamExportService.SpreadsheetType;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import static no.nav.data.common.export.ExcelBuilder.SPREADSHEETML_SHEET_MIME;
import static no.nav.data.common.utils.StreamUtils.convert;


@Slf4j
@RestController
@RequestMapping("/team")
@Tag(name = "Team", description = "Team endpoint")
public class TeamController {

    private final TeamService service;
    private final SyncService syncService;
    private final TeamExportService teamExportService;
    private final TeamCatalogProps teamCatalogProps;

    public TeamController(TeamService service, @Lazy SyncService syncService, TeamExportService teamExportService, TeamCatalogProps teamCatalogProps) {
        this.service = service;
        this.syncService = syncService;
        this.teamExportService = teamExportService;
        this.teamCatalogProps = teamCatalogProps;
    }

    @Operation(summary = "Get All Teams")
    @ApiResponse(description = "ok")
    @GetMapping
    public ResponseEntity<RestResponsePage<TeamResponse>> getAll(
            @RequestParam(name = "productAreaId", required = false) UUID productAreaId,
            @RequestParam(name = "clusterId", required = false) UUID clusterId
    ) {
        log.info("Get all Teams");
        List<Team> teams;
        if (productAreaId != null) {
            teams = service.findByProductArea(productAreaId);
        } else if (clusterId != null) {
            teams = service.findByCluster(clusterId);
        } else {
            teams = service.getAll();
        }
        return ResponseEntity.ok(new RestResponsePage<>(convert(teams, it -> it.convertToResponse(getDefaultProductAreaId()))));
    }

    @Operation(summary = "Get Team")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getById(@PathVariable UUID id) {
        log.info("Get Team id={}", id);
        return ResponseEntity.ok(service.get(id).convertToResponse(getDefaultProductAreaId()));
    }

    @Operation(summary = "Search teams")
    @ApiResponse(description = "Teams fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<TeamResponse>> searchTeamByName(@PathVariable String name) {
        log.info("Received request for Team with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search teams must be at least 3 characters");
        }
        var teams = service.search(name);
        log.info("Returned {} teams", teams.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, it -> it.convertToResponse(getDefaultProductAreaId()))), HttpStatus.OK);
    }

    @Operation(summary = "Create Team")
    @ApiResponse(responseCode = "201", description = "Team created")
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamRequest request) {
        log.info("Create Team");
        var team = service.save(request);
        return new ResponseEntity<>(team.convertToResponse(getDefaultProductAreaId()), HttpStatus.CREATED);
    }

    private UUID getDefaultProductAreaId() {
        return UUID.fromString(teamCatalogProps.getDefaultProductareaUuid());
    }

    @Operation(summary = "Create Teams")
    @ApiResponse(responseCode = "201", description = "Teams created")
    @Transactional
    @PostMapping("/batch")
    public ResponseEntity<RestResponsePage<TeamResponse>> createTeams(@RequestBody List<TeamRequest> requests) {
        log.info("Create Teams");
        var teams = convert(requests, service::save);
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, it -> it.convertToResponse(getDefaultProductAreaId()))), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Team", description = "If members is null members will not be updated")
    @ApiResponse(description = "Team updated")
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable UUID id, @Valid @RequestBody TeamRequest request) {
        log.debug("Update Team id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var team = service.save(request);
        return ResponseEntity.ok(team.convertToResponse(getDefaultProductAreaId()));
    }

    @Operation(summary = "Delete Team")
    @ApiResponse(description = "Team deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<TeamResponse> deleteTeamById(@PathVariable UUID id) {
        log.info("Delete Team id={}", id);
        var team = service.delete(id);
        return ResponseEntity.ok(team.convertToResponse(getDefaultProductAreaId()));
    }

    @Operation(summary = "Trigger sync")
    @ApiResponses(value = @ApiResponse(description = "Synced"))
    @PostMapping("/sync")
    public void sync(@RequestParam(name = "resetStatus", required = false, defaultValue = "false") boolean resetStatus) {
        if (resetStatus) {
            var resets = syncService.resetSyncStatus();
            log.info("reset sync status for {} objects", resets);
        }
        syncService.productAreaUpdates();
        syncService.clusterUpdates();
        syncService.teamUpdates();
    }

    @Operation(summary = "Get export for teams")
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
        byte[] doc = teamExportService.generate(type, id);
        String filename = "teams_" + type + Optional.ofNullable(id).map(s -> "-" + s).orElse("") + ".xlsx";
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

    static class TeamPageResponse extends RestResponsePage<TeamResponse> {

    }

}
