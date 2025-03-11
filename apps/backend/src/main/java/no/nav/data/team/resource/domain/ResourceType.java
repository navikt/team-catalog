package no.nav.data.team.resource.domain;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public enum ResourceType {
    INTERNAL,
    EXTERNAL,
    OTHER;

    public static ResourceType fromRessursType(String ressursType) {
        if (ressursType == null) {
            return null;
        }

        return ressursType.equals("EKSTERN") ? ResourceType.EXTERNAL : ResourceType.INTERNAL;
    }
}
