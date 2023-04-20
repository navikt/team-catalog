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

  return <HorizontalBarChart className={className} rows={data} title="Andel personer per rolle" />;
}

function formatData(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const allMembers = getAllMembers(teams, areas, clusters);
  const sortedRoles = sortRoles(allMembers);
  const sortedRolesCombined = combineSmallValues(sortedRoles);

  return sortedRolesCombined.map((roleWithCount) => {
    const productAreaIdSearchParameter = areas.length === 1 ? `&productAreaId=${areas[0].id}` : "";
    const clusterIdSearchParameter = clusters.length === 1 ? `&clusterId=${clusters[0].id}` : "";

    return {
      ...formatDataRow(roleWithCount, allMembers),
      url: `${roleWithCount.url}${productAreaIdSearchParameter}${clusterIdSearchParameter}`,
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
  const { clusterId, productAreaId } = useParams();

  const enumRoles = Object.keys(TeamRole) as TeamRole[];
  const output = enumRoles
    .map((role) => {
      const searchParameters = queryString.stringify({
        clusterId,
        productAreaId,
        role,
      });

      const numberOfMembersWithRole = members.filter((member) => member.roles.includes(role));
      return { label: intl[role], url: `/memberships?${searchParameters}`, value: numberOfMembersWithRole.length };
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
