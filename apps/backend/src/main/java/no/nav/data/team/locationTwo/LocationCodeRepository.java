package no.nav.data.team.locationTwo;

import no.nav.data.team.locationTwo.domain.Location;
import no.nav.data.team.locationTwo.domain.LocationType;
import org.springframework.stereotype.Component;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
class LocationCodeRepository {

    private final List<Location> locationHierarky = new LinkedList<>();
    private final Map<String, Location> locationByCode = new ConcurrentHashMap<>(10);

    public LocationCodeRepository(){
        locationHierarky.add(buildFAEN());

        locationHierarky.forEach(h -> {
            locationByCode.putAll(h.flatMap());
        });
    }

    public Location getLocationByCode(String code){
        return locationByCode.get(code);
    }

    public Map<String, Location> getLocationsByType(LocationType locationType){
        return locationByCode.entrySet().stream()
                .filter(e -> e.getValue().getLocationType().equals(locationType) || locationType == null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public List<Location> getLocationHierarky(){
        return locationHierarky;
    }

    public Map<String, Location> getLocation(){
        return locationByCode;
    }

    private Location buildFAEN(){
        return new Location("FA1", "Fyrstikk aleeen", LocationType.BUILDING)
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
