package no.nav.data.team.graph.dto;

import java.util.UUID;

public enum VertexLabel {
    ProductArea,
    Cluster,
    Team,
    Person;

    public String id(String id) {
        return name() + "." + id;
    }

    public String id(UUID id) {
        return name() + "." + id;
    }
}
