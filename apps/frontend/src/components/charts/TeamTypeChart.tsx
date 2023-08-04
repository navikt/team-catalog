import queryString from "query-string";
import { useParams } from "react-router-dom";

import type { ProductTeamResponse } from "../../constants";
import { TeamType } from "../../constants";
import { intl } from "../../util/intl/intl";
import { calculatePercentage } from "../../util/util";
import { HorizontalBarChart } from "./HorizontalBarChart";

export function TeamTypeChart({ teams }: { teams: ProductTeamResponse[] }) {
  const data = formatData(teams);

  return <HorizontalBarChart rows={data} title="Antall team per teamtype" />;
}

function formatData(teams: ProductTeamResponse[]) {
  const teamTypeKeys = Object.keys(TeamType) as TeamType[];
  const dataRows = teamTypeKeys.map((teamType) => formatDataRow(intl.getString(teamType), teams, teamType));
  return dataRows.filter((row) => row.value > 0);
}

function formatDataRow(label: string, teams: ProductTeamResponse[], teamType: TeamType) {
  const { clusterId, productAreaId } = useParams();
  const teamTypes = teams.map((team) => {
    return team.teamType ?? TeamType.UNKNOWN;
  });

  const typesInSegment = teamTypes.filter((n) => n === teamType);
  const numberOfTypes = typesInSegment.length;
  const percentage = calculatePercentage(typesInSegment.length, teamTypes.length);

  const searchParameters = queryString.stringify({ clusterId, productAreaId, teamType, filterName: label });

  return {
    label,
    percentage,
    value: numberOfTypes,
    url: `/teams/filter?${searchParameters}`,
  };
}
