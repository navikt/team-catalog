package no.nav.data.team.org;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.nom.graphql.model.OrgEnhetDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        log.info("Org get id={}", id);
        var org = nomGraphClient.getOrgEnhet(id);
        return org.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


}
