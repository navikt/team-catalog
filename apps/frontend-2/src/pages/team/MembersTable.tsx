import { Table } from "@navikt/ds-react";

import { UserImage } from "../../components/UserImage";
import type { Member } from "../../constants";
import { useAllClusters } from "../../hooks/useAllClusters";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";
import { useAllTeams } from "../../hooks/useAllTeams";
import { intl } from "../../util/intl/intl";

export function MembersTable({ members }: { members: Member[] }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col"> </Table.HeaderCell>
          <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
          <Table.HeaderCell scope="col">Team</Table.HeaderCell>
          <Table.HeaderCell scope="col">Område</Table.HeaderCell>
          <Table.HeaderCell scope="col">Klynger</Table.HeaderCell>
          <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
          <Table.HeaderCell scope="col">Annet</Table.HeaderCell>
          <Table.HeaderCell scope="col">Type</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {members.map((member) => (
          <MemberRow key={member.navIdent} member={member} />
        ))}
      </Table.Body>
    </Table>
  );
}

function MemberRow({ member }: { member: Member }) {
  const teamQuery = useAllTeams({});
  const productAreaQuery = useAllProductAreas({});
  const clusterQuery = useAllClusters({});

  const team = (teamQuery.data ?? []).find((team) =>
    team.members.some((teamMember) => teamMember.navIdent === member.navIdent)
  );

  const productArea = (productAreaQuery.data ?? []).find((productArea) =>
    productArea.members.some((productAreaMember) => productAreaMember.navIdent === member.navIdent)
  );

  const cluster = (clusterQuery.data ?? []).find((cluster) =>
    cluster.members.some((clusterMember) => clusterMember.navIdent === member.navIdent)
  );

  const resourceType = member.resource.resourceType;

  return (
    <Table.Row key={member.navIdent}>
      <Table.DataCell>
        <UserImage ident={member.navIdent} size="32px" />
      </Table.DataCell>
      <Table.DataCell>{member.resource.fullName}</Table.DataCell>
      <Table.DataCell>{team?.name}</Table.DataCell>
      <Table.DataCell>{productArea?.name || "-"}</Table.DataCell>
      <Table.DataCell>{cluster?.name || "-"}</Table.DataCell>
      <Table.DataCell>{member.roles.map((role) => intl[role]).join(", ")}</Table.DataCell>
      <Table.DataCell>{member.description || "-"}</Table.DataCell>
      <Table.DataCell>{resourceType ? intl[resourceType] : "-"}</Table.DataCell>
    </Table.Row>
  );
}
