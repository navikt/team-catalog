package no.nav.data.team.integration.process;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.integration.process.dto.ProcessResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@CrossOrigin
@Api(value = "Process", tags = {"Integration"})
@RequestMapping("/integration/process")
public class ProcessController {

    private final ProcessCatalogClient client;

    public ProcessController(ProcessCatalogClient client) {
        this.client = client;
    }

    @ApiOperation(value = "Get Processes")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Processes fetched", response = ProcessPage.class)})
    @GetMapping
    public ResponseEntity<RestResponsePage<ProcessResponse>> get(
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

    static class ProcessPage extends RestResponsePage<ProcessResponse> {

    }

}
