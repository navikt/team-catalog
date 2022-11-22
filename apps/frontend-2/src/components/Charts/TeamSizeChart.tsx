import { css } from "@emotion/css";
import inRange from "lodash/inRange";
import { createMemo } from "react-use";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { ProductTeam } from "../../constants";
import { useAllTeams } from "../../hooks/useAllTeams";

// NOTE 16 Nov 2022 (Johannes Moskvil): BarChart data must be memoized for LabelList to render correctly with animations
const useMemoTeamMembersData = createMemo(formatData);

export function TeamSizeChart() {
  const teams = useAllTeams({});

  const memoizedData = useMemoTeamMembersData(teams.data ?? []);

  if (memoizedData.length === 0) {
    return <></>;
  }

  return (
    <div
      className={css`
        background: #e6f1f8;
        padding: 2rem;
        width: max-content;
      `}
    >
      <BarChart
        barCategoryGap={2}
        barGap={4}
        barSize={25}
        data={memoizedData}
        height={300}
        layout="vertical"
        width={800}
      >
        <Bar dataKey="numberOfMembers" fill="#005077" onClick={(event) => console.log(event)} width={30}>
          <LabelList dataKey="numberOfMembers" position="right" />
        </Bar>
        <XAxis hide type="number" />
        <YAxis axisLine={false} dataKey="name" tickLine={false} type="category" width={200} />
      </BarChart>
    </div>
  );
}

function formatData(teams: ProductTeam[]) {
  return [
    formatDataRow("Ingen medlemmer", teams, [0, 1]),
    formatDataRow("1-5 medlemmer", teams, [1, 6]),
    formatDataRow("6-10 medlemmer", teams, [6, 11]),
    formatDataRow("11-20 medlemmer", teams, [11, 21]),
    formatDataRow("Over 20 medlemmer", teams, [21, Number.POSITIVE_INFINITY]),
  ];
}

function formatDataRow(text: string, teams: ProductTeam[], range: [number, number]) {
  const teamMembersSize = teams.map((team) => team.members.length);

  const membersInSegment = teamMembersSize.filter((n) => inRange(n, range[0], range[1]));
  const numberOfMembers = membersInSegment.length;

  const percentage = Math.round((membersInSegment.length / teamMembersSize.length) * 100);

  return {
    name: `${text} (${percentage}%)`,
    numberOfMembers,
  };
}
