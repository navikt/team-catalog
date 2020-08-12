package no.nav.data.team.location;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.storage.StorageService;
import no.nav.data.team.location.domain.LocationImage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/location")
@Api(value = "Location endpoint", tags = "Location")
public class LocationController {

    private final StorageService storage;

    public LocationController(StorageService storage) {
        this.storage = storage;
    }

    @ApiOperation("Get Resource")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = LocationImage.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/image/{id}")
    public ResponseEntity<LocationImage> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(storage.get(id, LocationImage.class));
    }

    @ApiOperation(value = "Save location image")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Location image saved", response = LocationImage.class)})
    @PostMapping
    public ResponseEntity<LocationImage> write(@RequestBody LocationImage locationImage) {
        return ResponseEntity.ok(storage.save(locationImage));
    }
}
