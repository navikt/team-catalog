import inRange from "lodash/inRange";

import type { ProductTeam } from "../../constants";
import { JohannesChart } from "./JohannesChart";

export function TeamSizeChart({ teams }: { teams: ProductTeam[] }) {
  const data = formatData(teams);

  return <JohannesChart rows={data} title="Andel team per teamstørrelse" />;
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

function formatDataRow(label: string, teams: ProductTeam[], range: [number, number]) {
  const teamMembersSize = teams.map((team) => team.members.length);

  const membersInSegment = teamMembersSize.filter((n) => inRange(n, range[0], range[1]));
  const numberOfMembers = membersInSegment.length;

  const percentage = Math.round((membersInSegment.length / teamMembersSize.length) * 100);

  const searchParameterForLessThan =
    range[1] === Number.POSITIVE_INFINITY ? "" : `numberOfMembersLessThan=${range[1]}&`;
  const searchParameterForGreaterThan = `numberOfMembersGreaterThan=${range[0]}`;

  const searchParameters = `${searchParameterForLessThan}${searchParameterForGreaterThan}&filterName=Teams bestående av ${label.toLowerCase()}`;
  return {
    label,
    percentage,
    value: numberOfMembers,
    url: `/teams/filter?${searchParameters}`,
  };
}
