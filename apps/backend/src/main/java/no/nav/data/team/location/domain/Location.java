package no.nav.data.team.location.domain;

import lombok.Getter;
import lombok.val;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

@Getter
public class Location {
    private final String code;
    private final String description;
    private final String displayName;
    private final LocationType type;
    private final Location parent;
    private final List<Location> subLocations = new LinkedList<>();

    public Location(String code, String description, LocationType type){
        this.code = code;
        this.description = this.displayName = description;
        this.type = type;
        this.parent = null;
    }

    public Location(String code, String description, LocationType type, Location parent){
        this.code = code;
        this.description = description;
        this.type = type;
        this.parent = parent;
        this.displayName = parent.getDisplayName()+", "+ description;
    }

    public Location newSubLocation(String locationCode, String locationDescription, LocationType locationType){
        val subLocation = new Location(this.code+"-"+locationCode,
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
        map.put(code, this);
        return map;
    }
}
