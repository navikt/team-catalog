package no.nav.data.team.org;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.StandardResponse;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.nom.graphql.model.OrgEnhetDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/org")
@Tag(name = "Org")
@RequiredArgsConstructor
public class OrgController {

    private final NomGraphClient nomGraphClient;

    @Operation(summary = "Get Org")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<OrgEnhetDto> getUnitsById(@PathVariable String id) {
        temporaryLogConsumer();

        log.info("Org get id={}", id);
        var org = nomGraphClient.getOrgEnhet(id);
        return org.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get Orgs")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<List<OrgEnhetDto>> getUnitsByIds(@RequestBody List<String> ids) {
        temporaryLogConsumer();

        log.info("Org get ids={}", ids);
        var orgs = nomGraphClient.getOrgEnheter(ids);
        return ResponseEntity.ok(orgs);
    }

    private void temporaryLogConsumer() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        var c = auth.getPrincipal().getClass();
        var x = SecurityUtils.getCurrentUser().map(UserInfo::getAppName);
        var y = SecurityUtils.getCurrentUser().map(UserInfo::getAppId);
        log.info("/org called by: name = " + x.orElse("<>") + " , id = " + y.orElse("<>") + " . Principal class = " + c.getName() + " , Authentication class = " + auth.getClass().getName());
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
