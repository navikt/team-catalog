package no.nav.data.team.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashResponse {

    private long productAreasCount;
    private long resources;
    private long resourcesDb;

    private TeamSummary total;
    private List<TeamSummary> productAreas;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TeamSummary {

        private UUID productAreaId;

        private long teams;
        private long teamsEditedLastWeek;

        private long teamEmpty;
        private long teamUpTo5;
        private long teamUpTo10;
        private long teamUpTo20;
        private long teamOver20;

        private long teamExternal0p;
        private long teamExternalUpto25p;
        private long teamExternalUpto50p;
        private long teamExternalUpto75p;
        private long teamExternalUpto100p;

        private long uniqueResources;
        private long uniqueResourcesExternal;
        private long totalResources;

        private List<RoleCount> roles;
        private List<TeamTypeCount> teamTypes;

    }

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
