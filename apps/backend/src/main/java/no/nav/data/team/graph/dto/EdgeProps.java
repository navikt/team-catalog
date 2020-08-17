package no.nav.data.team.graph.dto;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

public interface EdgeProps {

    @JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.NONE)
    class EmptyEdgeProps implements EdgeProps {

    }

}
