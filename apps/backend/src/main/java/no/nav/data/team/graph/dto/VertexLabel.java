package no.nav.data.team.graph.dto;

public enum VertexLabel {
    ProductArea,
    Team,
    Person;

    public String id(String id) {
        return name() + "." + id;
    }
}
