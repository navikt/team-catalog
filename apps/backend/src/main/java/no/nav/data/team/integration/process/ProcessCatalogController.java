package no.nav.data.team.integration.process;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.integration.process.dto.InfoTypeResponse;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@Tag(description = "ProcessCatalog", name = "Integration")
@RequestMapping("/integration/pcat")
public class ProcessCatalogController {

    private final ProcessCatalogClient client;

    public ProcessCatalogController(ProcessCatalogClient client) {
        this.client = client;
    }

    @Operation(summary = "Get Processes")
    @ApiResponses(value = {@ApiResponse(description = "Processes fetched")})
    @GetMapping("/process")
    public ResponseEntity<RestResponsePage<ProcessResponse>> getProcesses(
            @RequestParam(required = false) UUID teamId,
            @RequestParam(required = false) UUID productAreaId
    ) {
        if (teamId != null) {
            return ResponseEntity.ok(new RestResponsePage<>(client.getProcessesForTeam(teamId)));
        } else if (productAreaId != null) {
            return ResponseEntity.ok(new RestResponsePage<>(client.getProcessesForProductArea(productAreaId)));
        }
        return ResponseEntity.badRequest().build();
    }

    @Operation(summary = "Get InfoTypes")
    @ApiResponses(value = {@ApiResponse(description = "InfoTypes fetched")})
    @GetMapping("/informationtype")
    public ResponseEntity<RestResponsePage<InfoTypeResponse>> getInfoTypes(
            @RequestParam(required = false) UUID teamId,
            @RequestParam(required = false) UUID productAreaId
    ) {
        if (teamId != null) {
            return ResponseEntity.ok(new RestResponsePage<>(client.getInfoTypeForTeam(teamId)));
        } else if (productAreaId != null) {
            return ResponseEntity.ok(new RestResponsePage<>(client.getInfoTypeForProductArea(productAreaId)));
        }
        return ResponseEntity.badRequest().build();
    }

    static class ProcessPage extends RestResponsePage<ProcessResponse> {

    }

    static class InfoTypePage extends RestResponsePage<InfoTypeResponse> {

    }

}
