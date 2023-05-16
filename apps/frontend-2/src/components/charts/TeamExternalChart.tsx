import inRange from "lodash/inRange";
import queryString from "query-string";
import { useParams } from "react-router-dom";

import type { ProductTeam } from "../../constants";
import { ResourceType } from "../../constants";
import { calculatePercentage } from "../../util/util";
import { HorizontalBarChart } from "./HorizontalBarChart";

// TODO får feil tall for "ingen eksterne i dev fordi den teller ikke med team som har 0 medlemmer
export function TeamExternalChart({ teams }: { teams: ProductTeam[] }) {
  const data = formatData(teams);

  return <HorizontalBarChart rows={data} title="Antall eksterne i teamene" />;
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

function formatDataRow(label: string, teams: ProductTeam[], range: [number, number]) {
  const { clusterId, productAreaId } = useParams();
  const teamExternalMembersPercentage = teams.map((team) => {
    return team.members.length === 0 ? 0 : getExternalPercentage(team);
  });

  const membersInSegment = teamExternalMembersPercentage.filter((n) => inRange(n, range[0], range[1]));

  const numberOfMembers = membersInSegment.length;

  const percentage = calculatePercentage(membersInSegment.length, teamExternalMembersPercentage.length);

  const searchParameters = queryString.stringify({
    clusterId,
    productAreaId,
    percentageOfExternalLessThan: range[1],
    percentageOfExternalGreaterThan: range[0] - 1,
    filterName: `Teams med ${label.toLowerCase()}`,
  });

  return {
    label,
    percentage,
    value: numberOfMembers,
    url: `/teams/filter?${searchParameters}`,
  };
}

export function getExternalPercentage(team: ProductTeam) {
  const externalMembers = team.members.filter((member) => member.resource.resourceType === ResourceType.EXTERNAL);

  return calculatePercentage(externalMembers.length, team.members.length);
}
