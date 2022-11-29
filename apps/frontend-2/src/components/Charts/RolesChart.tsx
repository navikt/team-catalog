import { css } from "@emotion/css";
import { sortedIndex } from "lodash";
import { Fragment } from "react";
import { createMemo } from "react-use";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { Member, ProductTeam } from "../../constants";
import { TeamRole } from "../../constants";
import { useAllTeams } from "../../hooks/useAllTeams";
import { intl } from "../../util/intl/intl";

// NOTE 16 Nov 2022 (Johannes Moskvil): BarChart data must be memoized for LabelList to render correctly with animations
const useMemoTeamMembersData = createMemo(formatData);

export function RolesChart() {
  const teams = useAllTeams({});

  const memoizedData = useMemoTeamMembersData(teams.data ?? []);

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

function formatData(teams: ProductTeam[]) {
  const teamRoles = Object.keys(TeamRole);

  const sortedRoles = sortRoles(teamRoles, teams);
  const allMembers = teams.flatMap((team) => team.members);

  const output = sortedRoles.map((roleWithCount) => {
    return formatDataRow(intl[roleWithCount.role], allMembers, roleWithCount.members);
  });

  return output;
}

function formatDataRow(text: string, members: Member[], membersWithRole: number) {
  const percentage = Math.round((membersWithRole / members.length) * 100);

  return {
    name: `${text} (${percentage}%)`,
    membersWithRole,
  };
}

function sortRoles(roles: string[], teams: ProductTeam[]) {
  const enumRoles = roles.map((role) => role as TeamRole);
  const members = teams.flatMap((team) => team.members);

  const output = enumRoles.map((role) => {
    const membersWithRole = members.filter((member) => member.roles.includes(role));
    return { role: role, members: membersWithRole.length };
  });

  output.sort((a, b) => b.members - a.members);
  return output;
}
