package no.nav.data.team.resource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.naisteam.domain.NaisMember;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.dto.ResourceResponse;
import no.nav.data.team.resource.dto.ResourceUnitsResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;
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
    private final ResourceService resourceService;
    private final NaisTeamService naisTeamService;

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

    @Operation(summary = "Resources for naisteam")
    @ApiResponse(description = "Resources fetched")
    @GetMapping("/nais/{naisteam}")
    public ResponseEntity<RestResponsePage<ResourceResponse>> findResourcesForNaisTeam(@PathVariable String naisteam) {
        log.info("Resource for naisteam '{}'", naisteam);
        var naisTeam = naisTeamService.getTeam(naisteam).orElseThrow(() -> new NotFoundException("No naisteam named " + naisteam));
        var resources = naisTeam.getNaisMembers().stream()
                .map(NaisMember::getName)
                .filter(Objects::nonNull)
                .map(n -> n.replace(",", ""))
                .map(nomClient::search)
                .flatMap(page -> page.getContent().stream())
                .distinct()
                .collect(toList());
        return new ResponseEntity<>(new RestResponsePage<>(resources).convert(Resource::convertToResponse), HttpStatus.OK);
    }

    @Operation(summary = "Get Resource")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable String id) {
        log.info("Resource get id={}", id);
        var resource = nomClient.getByNavIdent(id);
        if (resource.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resource.get().convertToResponse());
    }

    @Operation(summary = "Get Resource Units")
    @ApiResponse(description = "ok")
    @GetMapping("/{id}/units")
    public ResponseEntity<ResourceUnitsResponse> getUnitsById(@PathVariable String id) {
        log.info("Resource get units id={}", id);
        var units = nomGraphClient.getDepartment(id);
        if (units == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ResourceUnitsResponse.from(units));
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
        var photo = resourceService.getPhoto(id, forceUpdate);

        if (photo.isMissing()) {
            log.info("Resource get photo id={} not found", id);
            return ResponseEntity.notFound().build();
        }
        log.info("Resource get photo id={}", id);
        return ResponseEntity.ok(photo.getContent());
    }

    static class ResourcePageResponse extends RestResponsePage<ResourceResponse> {

    }

}
