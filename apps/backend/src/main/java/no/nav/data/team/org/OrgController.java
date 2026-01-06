package no.nav.data.team.org;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.rest.StandardResponse;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.nom.graphql.model.OrgEnhetDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@Slf4j
@RestController
@RequestMapping("/org")
@Tag(name = "Org")
@RequiredArgsConstructor
public class OrgController {

    private final NomGraphClient nomGraphClient;
    private final SecurityUtils securityUtils;

    @Operation(summary = "Get Orgs", description = "Only for team-catalog-frackend")
    @ApiResponse(description = "ok")
    @PostMapping
    public ResponseEntity<List<OrgEnhetDto>> getUnitsByIds(@RequestBody List<String> ids) {
        securityUtils.assertAuthIsPermittedApp("org","team-catalog-frackend");

        var filteredNonNullIds = ids.stream().filter(Objects::nonNull).toList();
        log.info("Org get ids={}", ids);
        var orgs = nomGraphClient.getOrgEnheter(filteredNonNullIds);
        return ResponseEntity.ok(orgs);
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
