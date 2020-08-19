package no.nav.data.team.graph.dto;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public enum EdgeLabel {
    partOfProductArea,
    hasTeam(partOfProductArea),

    memberOfTeam,
    hasTeamMember(memberOfTeam),

    memberOfProductArea,
    hasProductAreaMember(memberOfProductArea);

    private EdgeLabel reverse;

    EdgeLabel(EdgeLabel revers) {
        this.reverse = revers;
        reverse.reverse = this;
    }

    public EdgeLabel reverse() {
        return reverse;
    }
}
