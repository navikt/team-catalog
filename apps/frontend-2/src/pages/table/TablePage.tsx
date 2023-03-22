import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { Cluster, Member, ProductArea, ProductTeam, TeamRole } from "../../constants";
import { Status } from "../../constants";
import { useAllClusters, useAllProductAreas, useAllTeams } from "../../hooks";
import { MembersTable } from "../team/MembersTable";

const TablePage = () => {
  const [members, setMembers] = useState<Member[]>([]);
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
    const currentMembers: Member[] = [];
    if (teams) {
      const teamMembers = teams.flatMap((team) => team.members);
      currentMembers.push(...teamMembers);
    }
    if (productAreas) {
      const productAreaMembers = productAreas.flatMap((productArea) => productArea.members);
      currentMembers.push(...productAreaMembers);
    }
    if (clusters) {
      const clusterMembers = clusters.flatMap((cluster) => cluster.members);
      currentMembers.push(...clusterMembers);
    }
    // console.log(currentMembers.length, "LENGDE")
    setMembers(currentMembers);
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
      return <MembersTable members={members} />;
    }
    if (filter === "role") {
      return <MembersTable members={members} role={filterValue as TeamRole} />;
    }
  }
  return <p>Du har funnet en død link</p>;
};

export default TablePage;
