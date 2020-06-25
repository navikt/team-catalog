package no.nav.data.team.resource.domain;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public enum ResourceType {
    INTERNAL,
    EXTERNAL;

    public static ResourceType fromRessursType(String ressursType) {
        if (ressursType == null) {
            return null;
        }
        switch (ressursType) {
            case "INTERN":
                return INTERNAL;
            case "EKSTERN":
                return EXTERNAL;
            case "ANNEN_STAT":
                // Annen statlig org? Helfo etc kommer her, filtrerer de ut
                return null;
            default:
                log.warn("illegal resource type {}", ressursType);
                return null;
        }
    }
}
