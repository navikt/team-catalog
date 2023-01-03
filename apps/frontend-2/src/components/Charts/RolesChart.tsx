import { css } from "@emotion/css";
import { Fragment } from "react";
import { createMemo } from "react-use";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { Cluster, Member, ProductArea, ProductTeam } from "../../constants";
import { Status, TeamRole } from "../../constants";
import { useAllClusters } from "../../hooks";
import { useAllProductAreas } from "../../hooks";
import { useAllTeams } from "../../hooks";
import { intl } from "../../util/intl/intl";

// NOTE 16 Nov 2022 (Johannes Moskvil): BarChart data must be memoized for LabelList to render correctly with animations
const useMemoTeamMembersData = createMemo(formatData);

export function RolesChart() {
  const teams = useAllTeams({ status: Status.ACTIVE });
  const areas = useAllProductAreas({ status: Status.ACTIVE });
  const clusters = useAllClusters({ status: Status.ACTIVE });

  const memoizedData = useMemoTeamMembersData(teams.data ?? [], areas.data ?? [], clusters.data ?? []);

  if (memoizedData.length === 0) {
    return <></>;
  }

  return (
    <Fragment>
      <h2>Andel personer per rolle</h2>
      <div
        className={css`
          background: #e6f1f8;
          padding: 2rem;
          width: max-content;
          margin-bottom: 2rem;
        `}
      >
        <BarChart
          barCategoryGap={2}
          barGap={4}
          barSize={25}
          data={memoizedData}
          height={1200}
          layout="vertical"
          width={600}
        >
          <Bar dataKey="membersWithRole" fill="#005077" onClick={(event) => console.log(event)} radius={3} width={30}>
            <LabelList dataKey="membersWithRole" position="right" />
          </Bar>
          <XAxis hide type="number" />
          <YAxis axisLine={false} dataKey="name" tickLine={false} type="category" width={200} />
        </BarChart>
      </div>
    </Fragment>
  );
}

function formatData(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const teamRoles = Object.keys(TeamRole);

  const allMembers = getAllMembers(teams, areas, clusters);
  const sortedRoles = sortRoles(teamRoles, allMembers);

  const sortedRolesCombined = combineSmallValues(sortedRoles);

  return sortedRolesCombined.map((roleWithCount) => {
    return formatDataRow(roleWithCount.role, allMembers, roleWithCount.membersWithRole);
  });
}

function formatDataRow(text: string, members: Member[], membersWithRole: number) {
  const percentage = Math.round((membersWithRole / members.length) * 100);

  return {
    name: `${text} (${percentage}%)`,
    membersWithRole,
  };
}

function combineSmallValues(
  items: { role: string; membersWithRole: number }[]
): { role: string; membersWithRole: number }[] {
  const combinedItems: { role: string; membersWithRole: number }[] = [];
  const others: { role: string; membersWithRole: number }[] = [];
  for (const item of items) {
    if (item.membersWithRole < 30) {
      others.push(item);
    } else {
      combinedItems.push(item);
    }
  }
  if (others.length > 0) {
    combinedItems.push({
      role: "Diverse mindre roller",
      membersWithRole: others.reduce((sum, item) => sum + item.membersWithRole, 0),
    });
  }
  return combinedItems;
}

function sortRoles(roles: string[], members: Member[]) {
  const enumRoles = roles.map((role) => role as TeamRole);

  const output = enumRoles.map((role) => {
    const membersWithRole = members.filter((member) => member.roles.includes(role));
    return { role: intl[role], membersWithRole: membersWithRole.length };
  });

  output.sort((a, b) => b.membersWithRole - a.membersWithRole);
  return output;
}

function getAllMembers(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const teamMembers = teams.flatMap((team) => team.members);
  const areaMembers = areas.flatMap((area) => area.members);
  const clusterMembers = clusters.flatMap((cluster) => cluster.members);

  return [...teamMembers, ...areaMembers, ...clusterMembers];
}
