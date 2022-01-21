package no.nav.data.team.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.team.location.domain.Location;
import no.nav.data.team.team.domain.TeamRole;
import no.nav.data.team.team.domain.TeamType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashResponse {

    private long productAreasCount;
    private long clusterCount;
    private long resources;
    private long resourcesDb;

    private TeamSummary total;

    private List<TeamSummary> productAreas;
    private List<TeamSummary> clusters;

    private Map<UUID,AreaSummary> areaSummaryMap;
    private Map<UUID,ClusterSummary> clusterSummaryMap;
    private Map<UUID,TeamSummary2> teamSummaryMap;
    private Map<String,LocationSummary> locationSummaryMap;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonInclude(Include.NON_NULL)
    public static class AreaSummary {

        private Long membershipCount;
        private Long uniqueResourcesCount;
        private Long teamCount;
        private Long totalTeamCount;
        private Long totalUniqueTeamCount;
        private Long clusterCount;
        private Long uniqueResourcesExternal;

    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonInclude(Include.NON_NULL)
    public static class ClusterSummary {

        private Long totalMembershipCount;
        private Long totalUniqueResourcesCount;
        private Long uniqueResourcesExternal;
        private Long teamCount;

    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonInclude(Include.NON_NULL)
    public static class TeamSummary2 {

        private Long membershipCount;
        private Long ResourcesExternal;
    }


    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonInclude(Include.NON_NULL)
    public static class TeamSummary {

        private UUID productAreaId;
        private UUID clusterId;

        private Long clusters;
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

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationSummary {
        private long teamCount;
        private long resourceCount;
    }
}
