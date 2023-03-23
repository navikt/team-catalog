import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { Cluster, Member, ProductArea, ProductTeam, TeamRole } from "../../constants";
import { Status } from "../../constants";
import { useAllClusters, useAllProductAreas, useAllTeams } from "../../hooks";
import { MembershipTable } from "../team/MembershipTable";

export interface Membership {
  member: Member;
  team?: { name: string; id?: string };
  area?: { name: string; id?: string };
  cluster?: { name: string; id?: string }[];
}
const TablePage = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);

  const [teams, setTeams] = useState<ProductTeam[]>();
  const [productAreas, setProductAreas] = useState<ProductArea[]>();
  const [clusters, setClusters] = useState<Cluster[]>();

  const { tableFilter, filter, filterValue } = useParams();

  const teamsData = useAllTeams({ status: Status.ACTIVE }).data;
  const productAreasData = useAllProductAreas({ status: Status.ACTIVE }).data;
  const clustersData = useAllClusters({ status: Status.ACTIVE }).data;

  if (teamsData && !teams) {
    setTeams(teamsData);
  }
  if (productAreasData && !productAreas) {
    setProductAreas(productAreasData);
  }
  if (clustersData && !clusters) {
    setClusters(clustersData);
  }

  useEffect(() => {
    const currentMembers: Membership[] = [];
    if (teams) {
      const teamMembers = teams.flatMap((team) =>
        team.members.map((member) => {
          const productAreaId = team.productAreaId;
          const clusterIds = team.clusterIds;

          const area = (productAreasData ?? []).find((area) => area.id === productAreaId);
          const clusters = (clustersData ?? []).filter((cluster) => clusterIds.includes(cluster.id));

          const membershipObject: Membership = { member: member, team: { name: team.name, id: team.id } };
          if (productAreaId && area) {
            membershipObject.area = { name: area.name };
          }
          if (clusters.length > 0) {
            const clusterNames = clusters.map((cluster) => cluster.name);
            const clusterArray = [];
            for (const name of clusterNames) {
              clusterArray.push({ name: name });
              membershipObject.cluster = clusterArray;
            }
          }
          return membershipObject;
        })
      );
      currentMembers.push(...teamMembers);
    }
    if (productAreas) {
      const productAreaMembers = productAreas.flatMap((productArea) =>
        productArea.members.map(
          (member) => ({ member: member, area: { name: productArea.name, id: productArea.id } } as Membership)
        )
      );
      currentMembers.push(...productAreaMembers);
    }
    if (clusters) {
      const clusterMembers = clusters.flatMap((cluster) =>
        cluster.members.map((member) => {
          const productAreaId = cluster.productAreaId;
          const area = (productAreasData ?? []).find((area) => area.id === productAreaId);
          const membershipObject: Membership = { member: member, cluster: [{ name: cluster.name, id: cluster.id }] };
          if (area) {
            membershipObject.area = { name: area.name };
          }
          return membershipObject;
        })
      );
      currentMembers.push(...clusterMembers);
    }
    setMemberships(currentMembers);
  }, [teams, productAreas, clusters]);

  /* TODO
   * tableFilter verdier:
   * - members
   * - teams
   * - areas
   * - clusters
   */

  if (tableFilter === "members") {
    if (filter === "all") {
      return <MembershipTable memberships={memberships} />;
    }
    if (filter === "role") {
      return (
        <MembershipTable
          memberships={memberships.filter((membership) => membership.member.roles.includes(filterValue as TeamRole))}
          role={filterValue as TeamRole}
        />
      );
    }
  }
  return <p>Du har funnet en død link</p>;
};

export default TablePage;
