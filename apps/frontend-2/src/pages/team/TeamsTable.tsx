import { Table } from "@navikt/ds-react";
import { Link } from "react-router-dom";

import type { ProductTeam } from "../../constants";
import { useAllClusters } from "../../hooks/useAllClusters";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";

export function TeamsTable({ teams }: { teams: ProductTeam[] }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
          <Table.HeaderCell scope="col">Område</Table.HeaderCell>
          <Table.HeaderCell scope="col">Klynger</Table.HeaderCell>
          <Table.HeaderCell scope="col">Medlemmer</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {teams.map((team) => (
          <TeamRow key={team.id} team={team} />
        ))}
      </Table.Body>
    </Table>
  );
}

function TeamRow({ team }: { team: ProductTeam }) {
  const productAreaQuery = useAllProductAreas({});
  const clusterQuery = useAllClusters({});

  const productArea = (productAreaQuery.data ?? []).find((productArea) => productArea.id === team.productAreaId);
  const clusters = (clusterQuery.data ?? []).filter((cluster) => team.clusterIds.includes(cluster.id));

  return (
    <Table.Row key={team.id}>
      <Table.DataCell>
        <Link to={`/team/${team.id}`}>{team.name}</Link>
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
      <Table.DataCell>{team.members.length}</Table.DataCell>
    </Table.Row>
  );
}
