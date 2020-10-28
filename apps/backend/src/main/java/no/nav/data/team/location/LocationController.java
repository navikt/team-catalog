package no.nav.data.team.location;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.NotFoundException;
import no.nav.data.common.rest.RestResponsePage;
import no.nav.data.common.storage.StorageService;
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
@Tag(description = "Location endpoint", name = "Location")
public class LocationController {

    private final StorageService storage;
    private final LocationRepository repository;

    public LocationController(StorageService storage, LocationRepository repository) {
        this.storage = storage;
        this.repository = repository;
    }

    @Operation(summary = "Get floors")
    @ApiResponse(description = "ok")
    @GetMapping("/floor")
    public ResponseEntity<RestResponsePage<Floor>> getFloors() {
        var floors = storage.getAll(Floor.class);
        return ResponseEntity.ok(new RestResponsePage<>(floors));
    }

    @Operation(summary = "Save floor")
    @ApiResponse(description = "Floor  saved")
    @PostMapping("/floor")
    public ResponseEntity<Floor> writeFloor(@RequestBody Floor floor) {
        return ResponseEntity.ok(storage.save(floor));
    }

    @Operation(summary = "Get floor image")
    @ApiResponse(description = "ok")
    @GetMapping("/image/{floorId}")
    public ResponseEntity<byte[]> getFloorImageByFloorId(@PathVariable String floorId) {
        var floor = repository.findFloorByFloorId(floorId)
                .orElseThrow(() -> new NotFoundException("No such floor")).getDomainObjectData(Floor.class);
        return ResponseEntity.ok(storage.get(floor.getLocationImageId(), FloorImage.class).getContent());
    }

    @Operation(summary = "Save floor image")
    @ApiResponse(description = "Floor image saved")
    @PostMapping("/image")
    public ResponseEntity<FloorImage> writeFloorImage(@RequestBody FloorImage floorImage) {
        return ResponseEntity.ok(storage.save(floorImage));
    }

    static class Floors extends RestResponsePage<Floor> {

    }
}
