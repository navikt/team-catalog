import { css } from "@emotion/css";
import inRange from "lodash/inRange";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { createMemo } from "react-use";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import type { ProductTeam } from "../../constants";
import { ResourceType, Status } from "../../constants";
import { useAllTeams } from "../../hooks/useAllTeams";

// NOTE 16 Nov 2022 (Johannes Moskvil): BarChart data must be memoized for LabelList to render correctly with animations
const useMemoTeamMembersData = createMemo(formatData);

// TODO får feil tall for "ingen eksterne i dev fordi den teller ikke med team som har 0 medlemmer
export function TeamExternalChart() {
  const teams = useAllTeams({ status: Status.ACTIVE });
  const navigate = useNavigate();
  const memoizedData = useMemoTeamMembersData(teams.data ?? []);

  if (memoizedData.length === 0) {
    return <></>;
  }

  return (
    <Fragment>
      <h2>Andel eksterne i teamene</h2>
      <div
        className={css`
          background: #e6f1f8;
          padding: 2rem;
          width: max-content;
          margin-bottom: 2rem;

          .recharts-bar-rectangle {
            cursor: pointer;
          }
        `}
      >
        <BarChart
          barCategoryGap={2}
          barGap={4}
          barSize={25}
          data={memoizedData}
          height={300}
          layout="vertical"
          width={600}
        >
          <Bar
            dataKey="numberOfMembers"
            fill="#005077"
            onClick={(event) => {
              console.log(event);
              navigate(`/team?${event.searchParameters}`);
            }}
            radius={3}
            width={30}
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
    formatDataRow("Ingen eksterne", teams, [0, 1]),
    formatDataRow("1-25% eksterne", teams, [1, 26]),
    formatDataRow("26-50% eksterne", teams, [26, 51]),
    formatDataRow("51-75% eksterne", teams, [51, 76]),
    formatDataRow("76-100% eksterne", teams, [76, 101]),
  ];
}

function formatDataRow(text: string, teams: ProductTeam[], range: [number, number]) {
  const teamExternalMembersPercentage = teams.map((team) => {
    return team.members.length === 0 ? 0 : getExternalPercentage(team);
  });

  const membersInSegment = teamExternalMembersPercentage.filter((n) => inRange(n, range[0], range[1]));

  const numberOfMembers = membersInSegment.length;

  const percentage = Math.round((membersInSegment.length / teamExternalMembersPercentage.length) * 100);

  return {
    name: `${text} (${percentage}%)`,
    searchParameters: `percentageOfExternalLessThan=${range[1]}&percentageOfExternalGreaterThan=${range[0] - 1}`,
    numberOfMembers,
  };
}

export function getExternalPercentage(team: ProductTeam) {
  const externalMembers = team.members.filter((member) => member.resource.resourceType === ResourceType.EXTERNAL);

  return Math.round((externalMembers.length / team.members.length) * 100);
}
