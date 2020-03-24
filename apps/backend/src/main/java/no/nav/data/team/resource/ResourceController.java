package no.nav.data.team.resource;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.ValidationException;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.resource.domain.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/resource")
@Api(value = "Resource endpoint", tags = "Resource")
public class ResourceController {

    private final NomClient service;

    public ResourceController(NomClient service) {
        this.service = service;
    }

    @ApiOperation(value = "Search resources")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Resources fetched", response = ResourcePageResponse.class),
            @ApiResponse(code = 500, message = "Internal server error")})
    @GetMapping("/search/{name}")
    public ResponseEntity<RestResponsePage<Resource>> searchResourceName(@PathVariable String name) {
        log.info("Received request for Resource with the name like {}", name);
        if (name.replace(" ", "").length() < 3) {
            throw new ValidationException("Search resource must be at least 3 characters");
        }
        var resources = service.search(name);
        log.info("Returned {} resources", resources.size());
        return new ResponseEntity<>(new RestResponsePage<>(resources), HttpStatus.OK);
    }

    @ApiOperation("Get Resource")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = Resource.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable String id) {
        log.info("Get Resource id={}", id);
        Resource resources = service.getByNavIdent(id);
        if (resources == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resources);
    }

    static class ResourcePageResponse extends RestResponsePage<Resource> {

    }

}
