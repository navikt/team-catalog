package no.nav.data.team.resource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.security.dto.UserInfo;
import no.nav.data.common.unleash.UnleashClient;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.naisteam.NaisConsoleClient;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.resource.dto.ResourceUnitsResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

@Slf4j
@RestController
@RequestMapping("/resource")
@Tag(name = "Resource")
@RequiredArgsConstructor
public class ResourceController {

    private final NomClient nomClient;
    private final NomGraphClient nomGraphClient;
    private final NaisConsoleClient naisTeamService;
    private final NomAzurePictureService nomAzurePictureService;
    private final UnleashClient unleashClient;

    @Operation(summary = "Search resources")
    @ApiResponse(description = "Resources fetched")
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<ResourceResponse>> searchResourceName(@PathVariable String name) {
        log.info("Resource search '{}'", name);
        if (Stream.of(name.split(" ")).sorted().distinct().collect(Collectors.joining("")).length() < 3) {
            throw new ValidationException("Search resource must be at least 3 characters");
        }
        var resources = nomClient.search(name);
        log.info("Returned {} resources", resources.getPageSize());
        return new ResponseEntity<>(resources.convert(Resource::convertToResponse), HttpStatus.OK);
    }


    @Operation(summary = "Get Resource")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable String id) {
        log.info("Resource get id={}", id);
        var resource = nomClient.getByNavIdent(id);
        return resource.map(value -> ResponseEntity.ok(value.convertToResponse())).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get Resource Units")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}/units")
    public ResponseEntity<ResourceUnitsResponse> getUnitsById(@PathVariable String id) {
        log.info("Resource get units id={}", id);

        try {
            var units = nomGraphClient.getUnits(id);
            return units.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to get units for " + id, e);
            return ResponseEntity.ok(null);
        }
    }

    @Operation(summary = "Get all underlying Ressurser Units for leader")
    @ApiResponse(description = "OK")
    @GetMapping("/{id}/all-underlying-units")
    public ResponseEntity<ResourceUnitsResponse> allUnderlyingUnits(@PathVariable String id, @RequestParam boolean includeMembers) {
        try {
            var units = nomGraphClient.getLeaderMembersActiveOnlyV2(id, includeMembers);
            return units.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Failed to get units for leader", e);
            return ResponseEntity.ok(null);
        }
    }

    @Operation(summary = "Get Resources")
    @ApiResponse(description = "ok")
    @PostMapping("/multi")
    public ResponseEntity<RestResponsePage<ResourceResponse>> getById(@RequestBody List<String> ids) {
        log.info("Resource get ids={}", ids);

        var resources = ids.stream()
                .map(nomClient::getByNavIdent)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(Resource::convertToResponse)
                .collect(toList());
        return ResponseEntity.ok(new RestResponsePage<>(resources));
    }

    @Operation(summary = "Get Resource Photo")
    @ApiResponse(description = "ok")
    @GetMapping(value = "/{id}/photo", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getPhoto(
            @PathVariable String id,
            @RequestParam(name = "forceUpdate", required = false, defaultValue = "false") boolean forceUpdate
    ) {
        id = StringUtils.upperCase(id);
        if (!Validator.NAV_IDENT_PATTERN.matcher(id).matches()) {
            log.info("Resource get photo id={} invalid id", id);
            return ResponseEntity.notFound().build();
        }
        var photo = nomAzurePictureService.getPhoto(id, forceUpdate);

        if (photo.isEmpty()) {
            log.info("Resource get photo id={} not found", id);
            return ResponseEntity.notFound().build();
        }
        log.info("Resource get photo id={}", id);
        return ResponseEntity.ok(photo.get());
    }


    static class ResourcePageResponse extends RestResponsePage<ResourceResponse> {
    }

}
