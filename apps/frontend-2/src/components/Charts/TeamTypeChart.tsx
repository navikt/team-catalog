import queryString from "query-string";
import { useParams } from "react-router-dom";

import type { ProductTeam } from "../../constants";
import { TeamOwnershipType } from "../../constants";
import { HorizontalBarChart } from "./HorizontalBarChart";

export function TeamTypeChart({ teams }: { teams: ProductTeam[] }) {
  const data = formatData(teams);

  return <HorizontalBarChart rows={data} title="Andel team per eierskapstype" />;
}

function formatData(teams: ProductTeam[]) {
  return [
    formatDataRow("Tverrfaglige produktteam", teams, TeamOwnershipType.PRODUCT),
    formatDataRow("IT-team", teams, TeamOwnershipType.IT),
    formatDataRow("Prosjektteam", teams, TeamOwnershipType.PROJECT),
    formatDataRow("Forvaltningsteam", teams, TeamOwnershipType.ADMINISTRATION),
    formatDataRow("Annet", teams, TeamOwnershipType.OTHER),
    formatDataRow("Ukjent", teams, TeamOwnershipType.UNKNOWN),
  ];
}

function formatDataRow(label: string, teams: ProductTeam[], teamOwnershipType: TeamOwnershipType) {
  const { clusterId, productAreaId } = useParams();
  const teamTypes = teams.map((team) => {
    return team.teamOwnershipType ?? TeamOwnershipType.UNKNOWN;
  });

  const typesInSegment = teamTypes.filter((n) => n === teamOwnershipType);
  const numberOfTypes = typesInSegment.length;

  const percentage = Math.round((typesInSegment.length / teamTypes.length) * 100);

  const searchParameters = queryString.stringify({ clusterId, productAreaId, teamOwnershipType, filterName: label });

  return {
    label,
    percentage,
    value: numberOfTypes,
    url: `/teams/filter?${searchParameters}`,
  };
}
