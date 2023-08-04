import queryString from "query-string";
import { useParams } from "react-router-dom";

import type { ProductTeamResponse } from "../../constants";
import { TeamOwnershipType } from "../../constants";
import { calculatePercentage } from "../../util/util";
import { HorizontalBarChart } from "./HorizontalBarChart";

export function TeamOwnershipTypeChart({ teams }: { teams: ProductTeamResponse[] }) {
  const data = formatData(teams);

  return <HorizontalBarChart rows={data} title="Antall team per eierskapstype" />;
}

function formatData(teams: ProductTeamResponse[]) {
  return [
    formatDataRow("Tverrfaglige produktteam", teams, TeamOwnershipType.PRODUCT),
    formatDataRow("IT-team", teams, TeamOwnershipType.IT),
    formatDataRow("Prosjektteam", teams, TeamOwnershipType.PROJECT),
    formatDataRow("Forvaltningsteam", teams, TeamOwnershipType.ADMINISTRATION),
    formatDataRow("Annet", teams, TeamOwnershipType.OTHER),
    formatDataRow("Ukjent", teams, TeamOwnershipType.UNKNOWN),
  ];
}

function formatDataRow(label: string, teams: ProductTeamResponse[], teamOwnershipType: TeamOwnershipType) {
  const { clusterId, productAreaId } = useParams();
  const teamTypes = teams.map((team) => {
    return team.teamOwnershipType ?? TeamOwnershipType.UNKNOWN;
  });

  const typesInSegment = teamTypes.filter((n) => n === teamOwnershipType);
  const numberOfTypes = typesInSegment.length;
  const percentage = calculatePercentage(typesInSegment.length, teamTypes.length);

  const searchParameters = queryString.stringify({ clusterId, productAreaId, teamOwnershipType, filterName: label });

  return {
    label,
    percentage,
    value: numberOfTypes,
    url: `/teams/filter?${searchParameters}`,
  };
}
