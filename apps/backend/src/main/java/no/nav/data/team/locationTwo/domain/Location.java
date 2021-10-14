package no.nav.data.team.locationTwo.domain;

import lombok.Getter;
import lombok.val;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

@Getter
public class Location {
    private final String locationCode;
    private final String locationDescription;
    private final LocationType locationType;
    private final Location parent;
    private final List<Location> subLocations = new LinkedList<>();

    public Location(String locationCode, String locationDescription, LocationType locationType){
        this.locationCode = locationCode;
        this.locationDescription = locationDescription;
        this.locationType = locationType;
        this.parent = null;
    }

    public Location(String locationCode, String locationDescription, LocationType locationType, Location parent){
        this.locationCode = locationCode;
        this.locationDescription = locationDescription;
        this.locationType = locationType;
        this.parent = parent;
    }

    public Location newSubLocation(String locationCode, String locationDescription, LocationType locationType){
        val subLocation = new Location((parent != null ? parent.getLocationCode()+"-" : "") + locationCode,
                locationDescription, locationType, this);
        subLocations.add(subLocation);
        return subLocation;
    }

    public Location build(){
        return parent;
    }

    public Map<String, Location> flatMap(){
        val map = new HashMap<String, Location>();
        subLocations.forEach(l -> map.putAll(l.flatMap()));
        map.put(locationCode, this);
        return map;
    }
}
