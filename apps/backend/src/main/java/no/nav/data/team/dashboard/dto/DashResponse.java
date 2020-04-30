package no.nav.data.team.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashResponse {

    private long teams;
    private long teamsEditedLastWeek;

    private long teamEmpty;
    private long teamUpTo5;
    private long teamUpTo10;
    private long teamUpTo20;
    private long teamOver20;

    private long uniqueResourcesInATeam;
    private long totalResources;
    private long resources;

    private List<RoleCount> roles;
    private List<TeamTypeCount> teamTypes;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoleCount {

        private TeamRole role;
        private long count;

    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TeamTypeCount {

        private TeamType type;
        private long count;

    }
}
