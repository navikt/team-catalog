import { Heading } from "@navikt/ds-react";
import inRange from "lodash/inRange";
import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { getExternalPercentage } from "../../components/Charts/TeamExternalChart";
import type { ProductTeam, TeamOwnershipType } from "../../constants";
import { useAllTeams } from "../../hooks";
import { TeamsTable } from "./TeamsTable";

export function TeamFilterPage() {
  const teamQuery = useAllTeams({});
  const teams = applyFilter(teamQuery.data ?? []);
  const [searchParameters] = useSearchParams();

  return (
    <div>
      <Heading level="1" size="medium" spacing>
        {searchParameters.get("filterName")}
      </Heading>
      <TeamsTable teams={teams} />
    </div>
  );
}

function applyFilter(teams: ProductTeam[]) {
  const [searchParameters] = useSearchParams();

  let filteredTeams = teams;

  const teamOwnershipType = searchParameters.get("teamOwnershipType");
  if (teamOwnershipType) {
    filteredTeams = filteredTeams.filter((team) => team.teamOwnershipType === (teamOwnershipType as TeamOwnershipType));
  }

  const percentageOfExternalLessThan = searchParameters.get("percentageOfExternalLessThan");
  if (percentageOfExternalLessThan) {
    filteredTeams = filteredTeams.filter((team) => getExternalPercentage(team) < Number(percentageOfExternalLessThan));
  }

  const percentageOfExternalGreaterThan = searchParameters.get("percentageOfExternalGreaterThan");
  if (percentageOfExternalGreaterThan) {
    filteredTeams = filteredTeams.filter(
      (team) => getExternalPercentage(team) > Number(percentageOfExternalGreaterThan)
    );
  }

  if (searchParameters.get("numberOfMembersLessThan") || searchParameters.get("numberOfMembersGreaterThan")) {
    filteredTeams = filteredTeams.filter((team) =>
      inRange(
        team.members.length,
        Number(searchParameters.get("numberOfMembersGreaterThan") ?? Number.NEGATIVE_INFINITY),
        Number(searchParameters.get("numberOfMembersLessThan") ?? Number.POSITIVE_INFINITY)
      )
    );
  }

  return filteredTeams;
}
