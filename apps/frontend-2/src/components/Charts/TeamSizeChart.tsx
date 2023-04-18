import { css } from "@emotion/css";
import inRange from "lodash/inRange";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { createMemo } from "react-use";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { ProductTeam } from "../../constants";
import { RECTANGLE_HOVER } from "./styles";

// NOTE 16 Nov 2022 (Johannes Moskvil): BarChart data must be memoized for LabelList to render correctly with animations
const useMemoTeamMembersData = createMemo(formatData);

export function TeamSizeChart({ teams }: { teams: ProductTeam[] }) {
  const navigate = useNavigate();

  const memoizedData = useMemoTeamMembersData(teams);

  if (memoizedData.length === 0) {
    return <></>;
  }

  return (
    <Fragment>
      <h2>Andel team per teamstørrelse </h2>
      <div
        className={css`
          background: #e6f1f8;
          padding: 2rem;
          width: max-content;
          margin-bottom: 2rem;
          ${RECTANGLE_HOVER}
        `}
      >
        <BarChart barSize={25} data={memoizedData} height={300} layout="vertical" margin={{ right: 40 }} width={600}>
          <Bar
            dataKey="numberOfMembers"
            fill="#005077"
            onClick={(event) => {
              navigate(`/teams/filter?${event.searchParameters}`);
            }}
            radius={3}
          >
            <LabelList dataKey="numberOfMembers" position="right" />
          </Bar>
          <XAxis hide type="number" />
          <YAxis axisLine={false} dataKey="name" tickLine={false} type="category" width={200} />
        </BarChart>
      </div>
    </Fragment>
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

  const searchParameterForLessThan =
    range[1] === Number.POSITIVE_INFINITY ? "" : `numberOfMembersLessThan=${range[1]}&`;
  const searchParameterForGreaterThan = `numberOfMembersGreaterThan=${range[0]}`;

  return {
    name: `${text} (${percentage}%)`,
    searchParameters: `${searchParameterForLessThan}${searchParameterForGreaterThan}&filterName=Teams bestående av ${text.toLowerCase()}`,
    numberOfMembers,
  };
}
