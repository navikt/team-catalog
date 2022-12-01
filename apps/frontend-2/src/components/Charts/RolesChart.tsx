import { css } from "@emotion/css";
import { Fragment } from "react";
import { createMemo } from "react-use";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { Cluster, Member, ProductArea, ProductTeam } from "../../constants";
import { Status, TeamRole } from "../../constants";
import { useAllClusters } from "../../hooks/useAllClusters";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";
import { useAllTeams } from "../../hooks/useAllTeams";
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

  return sortedRoles.map((roleWithCount) => {
    return formatDataRow(intl[roleWithCount.role], allMembers, roleWithCount.members);
  });
}

function formatDataRow(text: string, members: Member[], membersWithRole: number) {
  const percentage = Math.round((membersWithRole / members.length) * 100);

  return {
    name: `${text} (${percentage}%)`,
    membersWithRole,
  };
}

function sortRoles(roles: string[], members: Member[]) {
  const enumRoles = roles.map((role) => role as TeamRole);

  const output = enumRoles.map((role) => {
    const membersWithRole = members.filter((member) => member.roles.includes(role));
    return { role: role, members: membersWithRole.length };
  });

  output.sort((a, b) => b.members - a.members);
  return output;
}

function getAllMembers(teams: ProductTeam[], areas: ProductArea[], clusters: Cluster[]) {
  const teamMembers = teams.flatMap((team) => team.members);
  const areaMembers = areas.flatMap((area) => area.members);
  const clusterMembers = clusters.flatMap((cluster) => cluster.members);

  return [...teamMembers, ...areaMembers, ...clusterMembers];
}
