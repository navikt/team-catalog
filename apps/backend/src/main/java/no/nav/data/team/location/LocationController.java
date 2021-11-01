package no.nav.data.team.location;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.location.domain.LocationType;
import no.nav.data.team.location.dto.LocationResponse;
import no.nav.data.team.location.dto.LocationSimpleResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/location")
@RequiredArgsConstructor
@Tag(name = "Location", description = "Location endpoint")
public class LocationController {

    private final LocationRepository locationRepository;

    @GetMapping("/{code}")
    @Operation(summary = "Get location")
    @ApiResponse(description = "location fetched")
    public LocationResponse getLocation(@PathVariable String code){
        return locationRepository.getLocationByCode(code)
                .map(LocationResponse::convert)
                .orElse(null);
    }

    @GetMapping("/hierarchy")
    @Operation(summary = "Get location hierarchy")
    @ApiResponse(description = "Location hierarchy fetched")
    public List<LocationResponse> getLocationHierarchy(){
        return locationRepository.getLocationHierarchy().stream().map(LocationResponse::convert).toList();
    }

    @GetMapping("/simple/{code}")
    @Operation(summary = "Get location simple")
    @ApiResponse(description = "Location simple fetched")
    public LocationSimpleResponse getLocationSimple(@PathVariable String code){
        return locationRepository.getLocationByCode(code)
                .map(LocationSimpleResponse::convert)
                .orElse(null);
    }

    @GetMapping("/simple")
    @Operation(summary = "Get locations simple")
    @ApiResponse(description = "Location simple flatmap fetched")
    public List<LocationSimpleResponse> getLocationsSimple(@RequestParam(required = false) LocationType locationType){
        return locationRepository.getLocationsByType(locationType)
                .values()
                .stream()
                .map(LocationSimpleResponse::convert)
                .toList();
    }
}
