package no.nav.data.team.naisteam;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.naisteam.domain.NaisTeam;
import no.nav.data.team.naisteam.dto.NaisTeamResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@RestController
@CrossOrigin
@RequestMapping("/naisteam")
@Api(value = "Team", description = "REST API for nais teams", tags = {"Naisteam"})
public class NaisTeamController {

    private final NaisTeamService naisTeamService;

    public NaisTeamController(NaisTeamService naisTeamService) {
        this.naisTeamService = naisTeamService;
    }

    @ApiOperation(value = "Get all teams")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "NaisTeams fetched", response = TeamPage.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping
    public RestResponsePage<NaisTeamResponse> findAll() {
        log.info("Received a request for all teams");
        return new RestResponsePage<>(convert(naisTeamService.getAllTeams(), NaisTeam::convertToResponse));
    }

    @ApiOperation(value = "Get team")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "NaisTeams fetched", response = NaisTeamResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping("/{teamId}")
    public ResponseEntity<NaisTeamResponse> getTeamByName(@PathVariable String teamId) {
        log.info("Received request for Team with id {}", teamId);
        Optional<NaisTeam> team = naisTeamService.getTeam(teamId);
        if (team.isEmpty()) {
            throw new NotFoundException("Couldn't find team " + teamId);
        }
        return new ResponseEntity<>(team.get().convertToResponse(), HttpStatus.OK);
    }

    @ApiOperation(value = "Search teams")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "NaisTeams fetched", response = TeamPage.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<NaisTeamResponse>> searchTeamByName(@PathVariable String name) {
        log.info("Received request for Team with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search teams must be at least 3 characters");
        }
        var teams = naisTeamService.search(name);
        log.info("Returned {} teams", teams.size());
        return new ResponseEntity<>(new RestResponsePage<>(convert(teams, NaisTeam::convertToResponse)), HttpStatus.OK);
    }

    static class TeamPage extends RestResponsePage<NaisTeamResponse> {

    }
}
