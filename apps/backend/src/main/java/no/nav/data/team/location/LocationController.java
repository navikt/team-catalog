package no.nav.data.team.location;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.team.location.domain.Floor;
import no.nav.data.team.location.domain.FloorImage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/location")
@Api(value = "Location endpoint", tags = "Location")
public class LocationController {

    private final StorageService storage;
    private final LocationRepository repository;

    public LocationController(StorageService storage, LocationRepository repository) {
        this.storage = storage;
        this.repository = repository;
    }

    @ApiOperation("Get floors")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = Floors.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/floor")
    public ResponseEntity<RestResponsePage<Floor>> getFloors() {
        var floors = storage.getAll(Floor.class);
        return ResponseEntity.ok(new RestResponsePage<>(floors));
    }

    @ApiOperation(value = "Save floor")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Floor  saved", response = Floor.class)})
    @PostMapping("/floor")
    public ResponseEntity<Floor> writeFloor(@RequestBody Floor floor) {
        return ResponseEntity.ok(storage.save(floor));
    }

    @ApiOperation("Get floor image")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = FloorImage.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/image/{floorId}")
    public ResponseEntity<FloorImage> getFloorImageByFloorId(@PathVariable String floorId) {
        GenericStorage floorImage = repository.findFloorImageByFloorId(floorId).orElseThrow(() -> new NotFoundException("No such floor"));
        return ResponseEntity.ok(floorImage.getDomainObjectData(FloorImage.class));
    }

    @ApiOperation(value = "Save floor image")
    @ApiResponses(value = {@ApiResponse(code = 200, message = "Floor image saved", response = FloorImage.class)})
    @PostMapping("/image")
    public ResponseEntity<FloorImage> writeFloorImage(@RequestBody FloorImage floorImage) {
        return ResponseEntity.ok(storage.save(floorImage));
    }

    static class Floors extends RestResponsePage<Floor> {

    }
}
