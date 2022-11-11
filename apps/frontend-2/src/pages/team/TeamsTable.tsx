import { Table } from "@navikt/ds-react";

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
      <Table.DataCell>{team.name}</Table.DataCell>
      <Table.DataCell>{productArea?.name || "-"}</Table.DataCell>
      <Table.DataCell>{clusters.map((cluster) => cluster.name).join(", ")}</Table.DataCell>
      <Table.DataCell>{team.members.length}</Table.DataCell>
    </Table.Row>
  );
}
