package no.nav.data.team.graph.dto;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public enum EdgeLabel {
    partOfProductArea,

    paHasTeam(partOfProductArea),

    partOfCluster,
    clusterHasTeam(partOfCluster),

    memberOfTeam,
    memberOfProductArea,
    memberOfCluster;

    private EdgeLabel reverse;

    EdgeLabel(EdgeLabel revers) {
        this.reverse = revers;
        reverse.reverse = this;
    }

    public EdgeLabel reverse() {
        return reverse;
    }
}
