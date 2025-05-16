package no.nav.data.team.team;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import no.nav.data.common.exceptions.TechnicalException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.rest.StandardResponse;
import no.nav.data.team.location.LocationRepository;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.TeamExportService.SpreadsheetType;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.domain.TeamOwnershipType;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static no.nav.data.common.export.ExcelBuilder.SPREADSHEETML_SHEET_MIME;
import static no.nav.data.common.utils.StreamUtils.convert;


@Slf4j
@RestController
@RequestMapping("/team")
@Tag(name = "Team", description = "Team endpoint")
public class TeamController {

    private final TeamService service;
    private final TeamExportService teamExportService;
    private final LocationRepository locationRepository;

    public TeamController(TeamService service, TeamExportService teamExportService, LocationRepository locationRepository) {
        this.service = service;
        this.teamExportService = teamExportService;
        this.locationRepository = locationRepository;
    }

    @Operation(summary = "Get All Teams")
    @ApiResponse(description = "ok")
    @GetMapping()
    public ResponseEntity<RestResponsePage<TeamResponse>> getAll(
            @RequestParam(name = "productAreaId", required = false) UUID productAreaId,
            @RequestParam(name = "clusterId", required = false) UUID clusterId,
            @RequestParam(name = "locationCode", required = false) String locationCode,
            @RequestParam(name = "status", required = false, defaultValue = "ACTIVE,PLANNED,INACTIVE") String stringStatus
    ) {
        log.info("Get all Teams");

        var queryStatusList = DomainObjectStatus.fromQueryParameter(stringStatus);

        List<Team> teams;
        if (productAreaId != null) {
            teams = service.findByProductArea(productAreaId);
        } else if (clusterId != null) {
            teams = service.findByCluster(clusterId);
        } else {
            teams = service.getAll();
        }

        if(locationCode != null){
            val location = locationRepository.getLocationByCode(locationCode);
            val locations = location.isPresent() ? location.get().flatMap() : new HashMap<String, Location>();
            teams = teams.stream().filter(t -> locations.containsKey(t.getOfficeHours() != null ? t.getOfficeHours().getLocationCode() : null)).toList();
        }

        teams = teams.stream().filter(t -> queryStatusList.contains(t.getStatus())).toList();

        return ResponseEntity.ok(new RestResponsePage<>(convert(teams, Team::convertToResponse)));
    }

    @Operation(summary = "Get Team")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getById(@PathVariable UUID id) {
        log.info("Get Team id={}", id);
        return ResponseEntity.ok(service.get(id).convertToResponse());
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
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, Team::convertToResponse)), HttpStatus.OK);
    }

    @Operation(summary = "Create Team v1")
    @ApiResponse(responseCode = "201", description = "Team created")
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamRequest request) {
        log.info("Create Team v1");
        if (request.getTeamType() != null) request.setTeamOwnershipType( TeamOwnershipType.valueOf(request.getTeamType().name()) );
        return createTeam_v2(request);
    }

    @Operation(summary = "Create Team v2")
    @ApiResponse(responseCode = "201", description = "Team created")
    @PostMapping("v2")
    public ResponseEntity<TeamResponse> createTeam_v2(@RequestBody TeamRequest request) {
        log.info("Create Team v2");
        var team = service.save(request);
        return new ResponseEntity<>(team.convertToResponse(), HttpStatus.CREATED);
    }

    @Operation(summary = "Create Teams")
    @ApiResponse(responseCode = "201", description = "Teams created")
    @Transactional
    @PostMapping("/batch")
    public ResponseEntity<RestResponsePage<TeamResponse>> createTeams(@RequestBody List<TeamRequest> requests) {
        log.info("Create Teams");
        var teams = convert(requests, service::save);
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, Team::convertToResponse)), HttpStatus.CREATED);
    }

    @Operation(summary = "Update Team", description = "If members is null members will not be updated")
    @ApiResponse(description = "Team updated")
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable UUID id, @Valid @RequestBody TeamRequest request) {
        log.debug("Update Team v1 id={}", id);
        if (request.getTeamType() != null) request.setTeamOwnershipType( TeamOwnershipType.valueOf(request.getTeamType().name()) );
        return updateTeam_v2(id, request);
    }

    @Operation(summary = "Update Team", description = "If members is null members will not be updated")
    @ApiResponse(description = "Team updated")
    @PutMapping("v2/{id}")
    public ResponseEntity<TeamResponse> updateTeam_v2(@PathVariable UUID id, @Valid @RequestBody TeamRequest request) {
        log.debug("Update Team v2 id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var team = service.save(request);
        return ResponseEntity.ok(team.convertToResponse());
    }

    @Operation(summary = "Delete Team")
    @ApiResponse(description = "Team deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<TeamResponse> deleteTeamById(@PathVariable UUID id) {
        log.info("Delete Team id={}", id);
        var team = service.delete(id);
        return ResponseEntity.ok(team.convertToResponse());
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

    @ExceptionHandler({
            Exception.class
    })
    public ResponseEntity<StandardResponse> handleException(RuntimeException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(StandardResponse.builder().message(e.getMessage()).build());
    }

}
