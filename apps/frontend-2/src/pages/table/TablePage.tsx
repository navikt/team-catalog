import React from "react";
import { useSearchParams } from "react-router-dom";

import type { Cluster, Member, ProductArea, ProductTeam, ResourceType, TeamRole } from "../../constants";
import { Status } from "../../constants";
import { useAllClusters, useAllProductAreas, useAllTeams } from "../../hooks";
import { MembershipTable } from "./MembershipTable";

export type MembershipV2 = {
  member: Member;
  team?: ProductTeam;
  area?: ProductArea;
  clusters?: Cluster[];
};

const TablePage = () => {
  const memberships = useGetMemberships();

  return <MembershipTable memberships={applyMembershipFilter(memberships)} />;
};

function useGetMemberships() {
  const teamsData = useAllTeams({ status: Status.ACTIVE }).data ?? [];
  const productAreasData = useAllProductAreas({ status: Status.ACTIVE }).data ?? [];
  const clustersData = useAllClusters({ status: Status.ACTIVE }).data ?? [];

  const allTeamMembers = teamsData.flatMap((team) =>
    team.members.map((member) => {
      const area = productAreasData.find(({ id }) => id === team.productAreaId);
      const clusters = clustersData.filter((cluster) => team.clusterIds.includes(cluster.id));

      return {
        area,
        member,
        team,
        clusters,
      };
    })
  );

  const allAreaMembers = productAreasData.flatMap((area) => area.members.map((member) => ({ member, area })));
  const allClusterMembers = clustersData.flatMap((cluster) =>
    cluster.members.map((member) => {
      const area = productAreasData.find(({ id }) => id === cluster.productAreaId);

      return {
        member,
        clusters: [cluster],
        area,
      };
    })
  );

  return [...allTeamMembers, ...allAreaMembers, ...allClusterMembers];
}

function applyMembershipFilter(memberships: MembershipV2[]) {
  const [searchParameters] = useSearchParams();

  let filteredMemberships = memberships;

  const { role, type, productAreaId } = Object.fromEntries(searchParameters);

  if (role) {
    filteredMemberships = filteredMemberships.filter((membership) =>
      membership.member.roles.includes(role as TeamRole)
    );
  }

  if (type) {
    filteredMemberships = filteredMemberships.filter(
      (membership) => membership.member.resource.resourceType === (type as ResourceType)
    );
  }

  if (productAreaId) {
    filteredMemberships = filteredMemberships.filter((membership) => membership.area?.id === productAreaId);
  }

  return filteredMemberships;
}

export default TablePage;
