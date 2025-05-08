import { css } from "@emotion/css";
import type { SortState } from "@navikt/ds-react";
import { Table } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { Link } from "react-router-dom";

import type { ProductTeamResponse } from "../../constants";
import { useAllClusters } from "../../hooks/useAllClusters";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";
import { useTableSort } from "../../hooks/useTableSort";

export function TeamsTable({ teams }: { teams: ProductTeamResponse[] }) {
  const { sort, handleSortChange } = useTableSort();

  const teamsAsRowViewTeams = createTeamRowViewData(teams);
  const sortedTeams = sort ? sortTeams({ teams: teamsAsRowViewTeams, sort }) : teamsAsRowViewTeams;

  return (
    <div
      className={css`
        overflow-x: scroll;
      `}
    >
      <Table onSortChange={(sortKey) => handleSortChange(sortKey)} sort={sort}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader sortKey="name" sortable>
              Navn
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="productAreaName" sortable>
              Område
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="clusterName" sortable>
              Klynger
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="length" sortable>
              Medlemmer
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedTeams.map((team) => (
            <TeamRow key={team.id} team={team} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

function sortTeams({ teams, sort }: { teams: ReturnType<typeof createTeamRowViewData>; sort: SortState }) {
  const { orderBy, direction } = sort;

  const sortedMembersAscending = sortBy(teams, (team) => {
    // @ts-ignore
    const value = team[orderBy];

    if (typeof value === "string") {
      return value.toUpperCase().replaceAll(" ", "").replace("TEAM", "");
    }
    return value;
  });
  const reversed = direction === "descending";

  return reversed ? sortedMembersAscending.reverse() : sortedMembersAscending;
}

function createTeamRowViewData(teams: ProductTeamResponse[]) {
  const productAreaQuery = useAllProductAreas({});
  const clusterQuery = useAllClusters({});

  return teams.map((team) => {
    const productArea = (productAreaQuery.data ?? []).find((productArea) => productArea.id === team.productAreaId);
    const clusters = (clusterQuery.data ?? []).filter((cluster) => team.clusterIds.includes(cluster.id));

    return {
      id: team.id,
      name: team.name,
      productArea,
      productAreaName: productArea?.name,
      clusters,
      clusterName: clusters.map((cluster) => cluster.name).join(" "),
      length: team.members.length,
    };
  });
}

function TeamRow({ team }: { team: ReturnType<typeof createTeamRowViewData>[0] }) {
  const { id, name, productArea, clusters, length } = team;
  return (
    <Table.Row key={id}>
      <Table.DataCell>
        <Link to={`/team/${id}`}>{name}</Link>
      </Table.DataCell>
      <Table.DataCell>
        {productArea ? <Link to={`/area/${productArea?.id}`}>{productArea?.name || "-"}</Link> : "-"}
      </Table.DataCell>
      <Table.DataCell>
        {clusters.map((cluster) => (
          <Link key={cluster.id} to={`/cluster/${cluster.id}`}>
            {cluster.name}
          </Link>
        ))}
      </Table.DataCell>
      <Table.DataCell>{length}</Table.DataCell>
    </Table.Row>
  );
}
