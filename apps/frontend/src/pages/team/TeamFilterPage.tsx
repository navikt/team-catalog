import { Heading } from "@navikt/ds-react";
import inRange from "lodash/inRange";
import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { getExternalPercentage } from "../../components/charts/TeamExternalChart";
import type { ProductTeamResponse, TeamOwnershipType, TeamType } from "../../constants";
import { Status } from "../../constants";
import { useAllTeams } from "../../hooks";
import { TeamsTable } from "./TeamsTable";

export function TeamFilterPage() {
  const teamQuery = useAllTeams({ status: Status.ACTIVE });
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

function applyFilter(teams: ProductTeamResponse[]) {
  const [searchParameters] = useSearchParams();

  let filteredTeams = teams;

  const {
    teamType,
    teamOwnershipType,
    percentageOfExternalLessThan,
    percentageOfExternalGreaterThan,
    numberOfMembersLessThan,
    numberOfMembersGreaterThan,
    productAreaId,
    clusterId,
  } = Object.fromEntries(searchParameters);

  if (teamType) {
    filteredTeams = filteredTeams.filter((team) => team.teamType === (teamType as TeamType));
  }

  if (teamOwnershipType) {
    filteredTeams = filteredTeams.filter((team) => team.teamOwnershipType === (teamOwnershipType as TeamOwnershipType));
  }

  if (percentageOfExternalLessThan) {
    filteredTeams = filteredTeams.filter((team) => getExternalPercentage(team) < Number(percentageOfExternalLessThan));
  }

  if (percentageOfExternalGreaterThan) {
    filteredTeams = filteredTeams.filter(
      (team) => getExternalPercentage(team) > Number(percentageOfExternalGreaterThan),
    );
  }

  if (productAreaId) {
    filteredTeams = filteredTeams.filter((team) => team.productAreaId === productAreaId);
  }

  if (clusterId) {
    filteredTeams = filteredTeams.filter((team) => team.clusterIds.includes(clusterId));
  }

  if (numberOfMembersLessThan || numberOfMembersGreaterThan) {
    filteredTeams = filteredTeams.filter((team) =>
      inRange(
        team.members.length,
        Number(numberOfMembersGreaterThan ?? Number.NEGATIVE_INFINITY),
        Number(numberOfMembersLessThan ?? Number.POSITIVE_INFINITY),
      ),
    );
  }

  return filteredTeams;
}
