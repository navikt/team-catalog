import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";

import type { Cluster, Member, ProductArea, ProductTeam } from "../../constants";
import { TeamRole } from "../../constants";
import { intl } from "../../util/intl/intl";
import type { ChartRow } from "./JohannesChart";
import { JohannesChart } from "./JohannesChart";

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

  return <JohannesChart className={className} rows={data} title="Andel personer per rolle" />;
}

function formatData(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const allMembers = getAllMembers(teams, areas, clusters);
  const sortedRoles = sortRoles(allMembers);
  const sortedRolesCombined = combineSmallValues(sortedRoles);

  return sortedRolesCombined.map((roleWithCount) => {
    return formatDataRow(roleWithCount, allMembers);
  });
}

function formatDataRow(row: ChartRow, allMembers: Member[]) {
  const percentage = Math.round((row.value / allMembers.length) * 100);

  return {
    ...row,
    percentage,
  };
}

function combineSmallValues(dataRows: ChartRow[]) {
  const rows = dataRows.slice(0, 20);
  const rowsToBeSquashed = dataRows.slice(20);
  if (rowsToBeSquashed.length > 0) {
    rows.push({
      label: "Diverse mindre roller",
      value: sumBy(rowsToBeSquashed, "value"),
    });
  }
  return rows;
}

function sortRoles(members: Member[]) {
  const enumRoles = Object.keys(TeamRole) as TeamRole[];
  const output = enumRoles
    .map((role) => {
      const numberOfMembersWithRole = members.filter((member) => member.roles.includes(role));
      return { label: intl[role], url: `/memberships?role=${role}`, value: numberOfMembersWithRole.length };
    })
    .filter(({ value }) => value > 0);

  return sortBy(output, "value").reverse();
}

function getAllMembers(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const teamMembers = teams.flatMap((team) => team.members);
  const areaMembers = areas.flatMap((area) => area.members);
  const clusterMembers = clusters.flatMap((cluster) => cluster.members);

  return [...teamMembers, ...areaMembers, ...clusterMembers];
}
