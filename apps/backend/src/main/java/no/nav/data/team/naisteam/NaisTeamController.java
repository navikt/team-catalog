package no.nav.data.team.naisteam;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.naisteam.console.ConsoleClient;
import no.nav.data.team.naisteam.console.ConsoleTeam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/naisteam")
@Tag(name = "Team", description = "REST API for nais teams")
public class NaisTeamController {

    private final ConsoleClient naisTeamService;

    public NaisTeamController(ConsoleClient naisTeamService) {
        this.naisTeamService = naisTeamService;
    }

    @Operation(summary = "Get all teams")
    @ApiResponse(description = "NaisTeams fetched")
    @GetMapping
    public RestResponsePage<ConsoleTeam> findAll() {
        log.info("Received a request for all teams");
        return new RestResponsePage<>(naisTeamService.getAllTeams());
    }

    @Operation(summary = "Get team")
    @ApiResponse(description = "NaisTeams fetched")
    @GetMapping("/{teamId}")
    public ResponseEntity<ConsoleTeam> getTeamByName(@PathVariable String teamId) {
        log.info("Received request for Team with id {}", teamId);
        Optional<ConsoleTeam> team = naisTeamService.getTeam(teamId);
        if (team.isEmpty()) {
            throw new NotFoundException("Couldn't find team " + teamId);
        }
        return new ResponseEntity<>(team.get(), HttpStatus.OK);
    }

    @Operation(summary = "Search teams")
    @ApiResponse(description = "NaisTeams fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<ConsoleTeam>> searchTeamByName(@PathVariable String name) {
        log.info("Received request for Team with the name like {}", name);
        if (name.length() < 3) {
            throw new ValidationException("Search teams must be at least 3 characters");
        }
        var teams = naisTeamService.search(name);
        log.info("Returned {} teams", teams.size());
        return new ResponseEntity<>(new RestResponsePage<>(teams), HttpStatus.OK);
    }

    static class TeamPage extends RestResponsePage<ConsoleTeam> {

    }
}
