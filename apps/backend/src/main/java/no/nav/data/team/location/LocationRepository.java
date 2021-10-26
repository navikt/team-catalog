package no.nav.data.team.location;

import no.nav.data.team.location.domain.Location;
import no.nav.data.team.location.domain.LocationType;
import org.springframework.stereotype.Component;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class LocationRepository {

    private static final List<Location> locationHierarchy = new LinkedList<>();
    private static final Map<String, Location> locationByCode = new ConcurrentHashMap<>(10);

    public LocationRepository(){
        locationHierarchy.add(buildFAEN());

        locationHierarchy.forEach(h -> {
            locationByCode.putAll(h.flatMap());
        });
    }

    public static Location getLocationFor(String locationCode){
        return locationByCode.get(locationCode);
    }

    public Optional<Location> getLocationByCode(String code){
        return Optional.ofNullable(code != null ? locationByCode.get(code) : null);
    }

    public Map<String, Location> getLocationsByType(LocationType locationType){
        return locationByCode.entrySet().stream()
                .filter(e -> e.getValue().getType().equals(locationType) || locationType == null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public List<Location> getLocationHierarchy(){
        return locationHierarchy;
    }

    public Map<String, Location> getLocation(){
        return locationByCode;
    }

    private Location buildFAEN(){
        return new Location("FA1", "Fyrstikkalléen 1", LocationType.BUILDING)
                .newSubLocation("BA", "Bygg A", LocationType.SECTION)
                    .newSubLocation("E0", "Etasje 0", LocationType.FLOOR).build()
                    .newSubLocation("E1", "Etasje 1", LocationType.FLOOR).build()
                    .newSubLocation("E2", "Etasje 2", LocationType.FLOOR).build()
                    .newSubLocation("E3", "Etasje 3", LocationType.FLOOR).build()
                    .newSubLocation("E4", "Etasje 4", LocationType.FLOOR).build()
                    .newSubLocation("E5", "Etasje 5", LocationType.FLOOR).build()
                    .newSubLocation("E6", "Etasje 6", LocationType.FLOOR).build()
                    .newSubLocation("E7", "Etasje 7", LocationType.FLOOR).build()
                    .newSubLocation("E8", "Etasje 8", LocationType.FLOOR).build()
                .build()
                .newSubLocation("BB", "Bygg B", LocationType.SECTION)
                    .newSubLocation("E0", "Etasje 0", LocationType.FLOOR).build()
                    .newSubLocation("E1", "Etasje 1", LocationType.FLOOR).build()
                    .newSubLocation("E2", "Etasje 2", LocationType.FLOOR).build()
                    .newSubLocation("E3", "Etasje 3", LocationType.FLOOR).build()
                    .newSubLocation("E4", "Etasje 4", LocationType.FLOOR).build()
                    .newSubLocation("E5", "Etasje 5", LocationType.FLOOR).build()
                    .newSubLocation("E6", "Etasje 6", LocationType.FLOOR).build()
                    .newSubLocation("E7", "Etasje 7", LocationType.FLOOR).build()
                    .newSubLocation("E8", "Etasje 8", LocationType.FLOOR).build()
                .build()
                .newSubLocation("BC", "Bygg C", LocationType.SECTION)
                    .newSubLocation("E0", "Etasje 0", LocationType.FLOOR).build()
                    .newSubLocation("E1", "Etasje 1", LocationType.FLOOR).build()
                    .newSubLocation("E2", "Etasje 2", LocationType.FLOOR).build()
                    .newSubLocation("E3", "Etasje 3", LocationType.FLOOR).build()
                    .newSubLocation("E4", "Etasje 4", LocationType.FLOOR).build()
                    .newSubLocation("E5", "Etasje 5", LocationType.FLOOR).build()
                    .newSubLocation("E6", "Etasje 6", LocationType.FLOOR).build()
                    .newSubLocation("E7", "Etasje 7", LocationType.FLOOR).build()
                    .newSubLocation("E8", "Etasje 8", LocationType.FLOOR).build()
                .build();
    }
}
