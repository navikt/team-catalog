package no.nav.data.team.integration.process;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import no.nav.data.team.team.TeamService;
import no.nav.data.team.team.domain.Team;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@Tag(description = "ProcessCatalog", name = "Integration")
@RequestMapping("/integration/pcat")
@RequiredArgsConstructor
public class ProcessCatalogController {

    private final TeamService teamService;
    private final ProcessCatalogClient client;

    @Operation(summary = "Get Processes")
    @ApiResponses(value = {@ApiResponse(description = "Processes fetched")})
    @GetMapping("/process")
    public ResponseEntity<RestResponsePage<ProcessResponse>> getProcesses(
            @RequestParam(required = false) UUID teamId,
            @RequestParam(required = false) UUID productAreaId,
            @RequestParam(required = false) UUID clusterId
    ) {
        if (teamId != null) {
            return ResponseEntity.ok(new RestResponsePage<>(client.getProcessesForTeam(teamId)));
        } else if (productAreaId != null) {
            return ResponseEntity.ok(new RestResponsePage<>(getProcessesForTeams(teamService.findByProductArea(productAreaId))));
        } else if (clusterId != null) {
            return ResponseEntity.ok(new RestResponsePage<>(getProcessesForTeams(teamService.findByCluster(clusterId))));
        }
        return ResponseEntity.badRequest().build();
    }

    private List<ProcessResponse> getProcessesForTeams(List<Team> teams) {
        return teams.parallelStream()
                .map(Team::getId)
                .map(client::getProcessesForTeam)
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
    }

    static class ProcessPage extends RestResponsePage<ProcessResponse> {

    }

}
