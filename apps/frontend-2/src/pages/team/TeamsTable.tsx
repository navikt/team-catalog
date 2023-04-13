import type { SortState } from "@navikt/ds-react";
import { Table } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { useState } from "react";
import { Link } from "react-router-dom";

import type { ProductTeam } from "../../constants";
import { useAllClusters } from "../../hooks/useAllClusters";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";

export function TeamsTable({ teams }: { teams: ProductTeam[] }) {
  const [sort, setSort] = useState<SortState | undefined>(undefined);

  const handleSort = (sortKey: string | undefined) => {
    if (sortKey) {
      setSort({
        orderBy: sortKey,
        direction: sort && sortKey === sort.orderBy && sort.direction === "ascending" ? "descending" : "ascending",
      });
    } else {
      setSort(undefined);
    }
  };

  const teamsAsRowViewTeams = createTeamRowViewData(teams);
  const sortedTeams = sort ? sortTeams({ teams: teamsAsRowViewTeams, sort }) : teamsAsRowViewTeams;

  return (
    <Table onSortChange={(sortKey) => handleSort(sortKey)} sort={sort}>
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
  );
}

function sortTeams({ teams, sort }: { teams: ReturnType<typeof createTeamRowViewData>; sort: SortState }) {
  const { orderBy, direction } = sort;

  const sortedMembersAscending = sortBy(teams, (team) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return team[orderBy].toUpperCase().replace("TEAM ", "");
  });
  const reversed = direction === "descending";

  return reversed ? sortedMembersAscending.reverse() : sortedMembersAscending;
}

function createTeamRowViewData(teams: ProductTeam[]) {
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
