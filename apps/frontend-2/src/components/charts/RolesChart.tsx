import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
import queryString from "query-string";
import { useParams } from "react-router-dom";

import type { Cluster, Member, ProductArea, ProductTeam } from "../../constants";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import type { ChartRow } from "./HorizontalBarChart";
import { HorizontalBarChart } from "./HorizontalBarChart";

export function RolesChart({
  teams,
  areas,
  clusters,
  className,
}: {
  teams: ProductTeam[];
  areas: ProductArea[];
  clusters: Cluster[];
  className?: string;
}) {
  const data = formatData(teams, areas, clusters);

  return <HorizontalBarChart className={className} rows={data} title="Antall personer per rolle" />;
}

function formatData(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const allMembers = getAllMembers(teams, areas, clusters);
  const sortedRoles = sortRoles(allMembers);

  return sortedRoles.map((roleWithCount) => {
    return {
      ...formatDataRow(roleWithCount, allMembers),
      url: `${roleWithCount.url}`,
    };
  });
}

function formatDataRow(row: ChartRow, allMembers: Member[]) {
  const percentage = Math.round((row.value / allMembers.length) * 100);

  return {
    ...row,
    percentage,
  };
}

function sortRoles(members: Member[]) {
  const { clusterId, productAreaId } = useParams();

  const enumRoles = Object.keys(TeamRole) as TeamRole[];
  const membersPerRole = sortBy(
    enumRoles.map((role) => ({
      role,
      value: members.filter((member) => member.roles.includes(role)).length,
    })),
    "value"
  )
    .filter(({ value }) => value > 0)
    .reverse();

  const roles = membersPerRole.slice(0, 20);
  const rolesToBeSquashed = membersPerRole.slice(20);

  const output = roles.map((roleWithCount) => {
    const { role, value } = roleWithCount;
    const searchParameters = queryString.stringify({
      clusterId,
      productAreaId,
      role,
    });

    return { label: intl[role], url: `/memberships?${searchParameters}`, value };
  });

  if (rolesToBeSquashed.length > 0) {
    const searchParameters = queryString.stringify({
      clusterId,
      productAreaId,
      role: rolesToBeSquashed.map(({ role }) => role),
    });

    const aggregatedRole = {
      url: `/memberships?${searchParameters}`,
      label: "Diverse mindre roller",
      value: sumBy(rolesToBeSquashed, "value"),
    };

    return [...output, aggregatedRole];
  }

  return output;
}

function getAllMembers(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const teamMembers = teams.flatMap((team) => team.members);
  const areaMembers = areas.flatMap((area) => area.members);
  const clusterMembers = clusters.flatMap((cluster) => cluster.members);

  return [...teamMembers, ...areaMembers, ...clusterMembers];
}
