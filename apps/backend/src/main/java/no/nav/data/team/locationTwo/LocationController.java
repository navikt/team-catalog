package no.nav.data.team.locationTwo;

import lombok.RequiredArgsConstructor;
import no.nav.data.team.locationTwo.domain.Location;
import no.nav.data.team.locationTwo.domain.LocationType;
import no.nav.data.team.locationTwo.dto.LocationResponse;
import no.nav.data.team.locationTwo.dto.LocationSimpleResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController("/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationCodeRepository locationCodeRepository;

    @GetMapping("/{code}")
    public LocationResponse getLocation(@PathVariable String code){
        return convert(locationCodeRepository.getLocationByCode(code));
    }

    @GetMapping("/hierarky")
    public List<LocationResponse> getLocationHierarky(){
        return locationCodeRepository.getLocationHierarky().stream().map(this::convert).toList();
    }

    @GetMapping("/simple/{code}")
    public LocationSimpleResponse getLocationSimple(@PathVariable String code){
        return convertSimple(locationCodeRepository.getLocationByCode(code));
    }

    @GetMapping("/simple")
    public Map<String, LocationSimpleResponse> getLocationsSimple(@RequestParam(required = false) LocationType locationType){
        return locationCodeRepository.getLocationsByType(locationType).entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> convertSimple(e.getValue())));
    }

    public LocationResponse convert(Location location){
        return LocationResponse.builder()
                .locationCode(location.getLocationCode())
                .locationDescription(location.getLocationDescription())
                .locationType(location.getLocationType())
                .subLocations(location.getSubLocations().stream().map(this::convert).toList())
                .build();
    }

    public LocationSimpleResponse convertSimple(Location location){
        return LocationSimpleResponse.builder()
                .locationCode(location.getLocationCode())
                .locationDescription(location.getLocationDescription())
                .locationType(location.getLocationType())
                .build();
    }
}
