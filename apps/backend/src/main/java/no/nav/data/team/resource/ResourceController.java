package no.nav.data.team.resource;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.naisteam.NaisTeamService;
import no.nav.data.team.naisteam.domain.NaisMember;
import no.nav.data.team.resource.domain.Resource;
import no.nav.data.team.resource.dto.ResourceResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.stream.Collectors.toList;

@Slf4j
@RestController
@RequestMapping("/resource")
@Api(value = "Resource endpoint", tags = "Resource")
public class ResourceController {

    private final NomClient nomClient;
    private final ResourceService resourceService;
    private final NaisTeamService naisTeamService;

    public ResourceController(NomClient nomClient, ResourceService resourceService, NaisTeamService naisTeamService) {
        this.nomClient = nomClient;
        this.resourceService = resourceService;
        this.naisTeamService = naisTeamService;
    }

    @ApiOperation(value = "Search resources")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Resources fetched", response = ResourcePageResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
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

    @ApiOperation(value = "Resources for naisteam")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Resources fetched", response = ResourcePageResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
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

    @ApiOperation("Get Resource")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = ResourceResponse.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable String id) {
        log.info("Resource get id={}", id);
        var resource = nomClient.getByNavIdent(id);
        if (resource.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resource.get().convertToResponse());
    }

    @ApiOperation("Get Resource Photo")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = byte[].class),
            @ApiResponse(code = 404, message = "not found")
    })
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
