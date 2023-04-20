import inRange from "lodash/inRange";
import queryString from "query-string";
import { useParams } from "react-router-dom";

import type { ProductTeam } from "../../constants";
import { HorizontalBarChart } from "./HorizontalBarChart";

export function TeamSizeChart({ teams }: { teams: ProductTeam[] }) {
  const data = formatData(teams);

  return <HorizontalBarChart rows={data} title="Andel team per teamstørrelse" />;
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
  const { clusterId, productAreaId } = useParams();
  const teamMembersSize = teams.map((team) => team.members.length);

  const membersInSegment = teamMembersSize.filter((n) => inRange(n, range[0], range[1]));
  const numberOfMembers = membersInSegment.length;

  const percentage = Math.round((membersInSegment.length / teamMembersSize.length) * 100);

  const searchParameters = queryString.stringify({
    clusterId,
    productAreaId,
    numberOfMembersLessThan: range[1] === Number.POSITIVE_INFINITY ? undefined : range[1],
    numberOfMembersGreaterThan: range[0],
    filterName: `Teams bestående av ${label.toLowerCase()}`,
  });

  return {
    label,
    percentage,
    value: numberOfMembers,
    url: `/teams/filter?${searchParameters}`,
  };
}
