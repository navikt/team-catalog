package no.nav.data.team.integration.process;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.team.integration.process.dto.InfoTypeResponse;
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
@Api(value = "ProcessCatalog", tags = {"Integration"})
@RequestMapping("/integration/pcat")
public class ProcessCatalogController {

    private final ProcessCatalogClient client;

    public ProcessCatalogController(ProcessCatalogClient client) {
        this.client = client;
    }

    @ApiOperation(value = "Get Processes")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Processes fetched", response = ProcessPage.class)})
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

    @ApiOperation(value = "Get InfoTypes")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "InfoTypes fetched", response = InfoTypePage.class)})
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
