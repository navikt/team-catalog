package no.nav.data.team.team;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.sync.SyncService;
import no.nav.data.team.team.TeamExportService.SpreadsheetType;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
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
@Api(value = "Team endpoint", tags = "Team")
public class TeamController {

    private final TeamService service;
    private final SyncService syncService;
    private final TeamExportService teamExportService;

    public TeamController(TeamService service, SyncService syncService, TeamExportService teamExportService) {
        this.service = service;
        this.syncService = syncService;
        this.teamExportService = teamExportService;
    }

    @ApiOperation("Get All Teams")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = TeamPageResponse.class)
    })
    @GetMapping
    public ResponseEntity<RestResponsePage<TeamResponse>> getAll(
            @RequestParam(name = "productAreaId", required = false) UUID productAreaId
    ) {
        log.info("Get all Teams");
        List<Team> teams;
        if (productAreaId != null) {
            teams = service.findByProductArea(productAreaId);
        } else {
            teams = service.getAll();
        }
        return ResponseEntity.ok(new RestResponsePage<>(convert(teams, Team::convertToResponse)));
    }

    @ApiOperation("Get Team")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = TeamResponse.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getById(@PathVariable UUID id) {
        log.info("Get Team id={}", id);
        return ResponseEntity.ok(service.get(id).convertToResponse());
    }

    @ApiOperation(value = "Search teams")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Teams fetched", response = TeamPageResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<TeamResponse>> searchTeamByName(@PathVariable String name) {
        log.info("Received request for Team with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search teams must be at least 3 characters");
        }
        var teams = service.search(name);
        log.info("Returned {} teams", teams.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, Team::convertToResponse)), HttpStatus.OK);
    }

    @ApiOperation(value = "Create Team")
    @ApiResponses(value = {
            @ApiResponse(code = 201, message = "Team created", response = TeamResponse.class),
            @ApiResponse(code = 400, message = "Illegal arguments"),
    })
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamRequest request) {
        log.info("Create Team");
        var team = service.save(request);
        return new ResponseEntity<>(team.convertToResponse(), HttpStatus.CREATED);
    }

    @ApiOperation(value = "Create Teams")
    @ApiResponses(value = {
            @ApiResponse(code = 201, message = "Teams created", response = TeamPageResponse.class),
            @ApiResponse(code = 400, message = "Illegal arguments"),
    })
    @Transactional
    @PostMapping("/batch")
    public ResponseEntity<RestResponsePage<TeamResponse>> createTeams(@RequestBody List<TeamRequest> requests) {
        log.info("Create Teams");
        var teams = convert(requests, service::save);
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, Team::convertToResponse)), HttpStatus.CREATED);
    }

    @ApiOperation(value = "Update Team", notes = "If members is null members will not be updated")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Team updated", response = TeamResponse.class),
            @ApiResponse(code = 400, message = "Illegal arguments"),
            @ApiResponse(code = 404, message = "Team not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable UUID id, @Valid @RequestBody TeamRequest request) {
        log.debug("Update Team id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var team = service.save(request);
        return ResponseEntity.ok(team.convertToResponse());
    }

    @ApiOperation(value = "Delete Team")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Team deleted", response = TeamResponse.class),
            @ApiResponse(code = 404, message = "Team not found"),
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<TeamResponse> deleteTeamById(@PathVariable UUID id) {
        log.info("Delete Team id={}", id);
        var team = service.delete(id);
        return ResponseEntity.ok(team.convertToResponse());
    }

    @ApiOperation(value = "Trigger sync")
    @ApiResponses(value = @ApiResponse(code = 200, message = "Synced"))
    @PostMapping("/sync")
    public void sync(@RequestParam(name = "resetStatus", required = false, defaultValue = "false") boolean resetStatus) {
        if (resetStatus) {
            var resets = syncService.resetSyncStatus();
            log.info("reset sync status for {} objects", resets);
        }
        syncService.productAreaUpdates();
        syncService.teamUpdates();
    }


    @ApiOperation(value = "Get export for teams")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Doc fetched", response = byte[].class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @Transactional(readOnly = true)
    @SneakyThrows
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
        String filename = "teams" + type + Optional.ofNullable(id).map(s -> "_" + s).orElse("") + ".xlsx";
        response.setContentType(SPREADSHEETML_SHEET_MIME);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        StreamUtils.copy(doc, response.getOutputStream());
        response.flushBuffer();
    }

    static class TeamPageResponse extends RestResponsePage<TeamResponse> {

    }

}
