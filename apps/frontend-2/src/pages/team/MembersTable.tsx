import type { SortState } from "@navikt/ds-react";
import { Table } from "@navikt/ds-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { UserImage } from "../../components/UserImage";
import type { Member } from "../../constants";
import { useAllClusters } from "../../hooks/useAllClusters";
import { useAllProductAreas } from "../../hooks/useAllProductAreas";
import { useAllTeams } from "../../hooks/useAllTeams";
import { intl } from "../../util/intl/intl";

export function MembersTable({ members }: { members: Member[] }) {
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

  return (
    <Table onSortChange={(sortKey) => handleSort(sortKey)} sort={sort}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col"> </Table.HeaderCell>
          <Table.ColumnHeader sortKey="name" sortable>
            Navn
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="teamName" sortable>
            Team
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="productAreaName" sortable>
            Område
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="clusterName" sortable>
            Klynger
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="role" sortable>
            Rolle
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="description" sortable>
            Annet
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="type" sortable>
            Type
          </Table.ColumnHeader>
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
      <Table.DataCell>
        <Link to={`/resource/${member.navIdent}`}>{member.resource.fullName}</Link>
      </Table.DataCell>
      <Table.DataCell>{team ? <Link to={`/team/${team.id}`}>{team.name}</Link> : "-"}</Table.DataCell>
      <Table.DataCell>
        {productArea ? <Link to={`/area/${productArea.id}`}>{productArea.name}</Link> : "-"}
      </Table.DataCell>
      <Table.DataCell>{cluster ? <Link to={`/cluster/${cluster.id}`}>{cluster.name}</Link> : "-"}</Table.DataCell>
      <Table.DataCell>{member.roles.map((role) => intl[role]).join(", ")}</Table.DataCell>
      <Table.DataCell>{member.description || "-"}</Table.DataCell>
      <Table.DataCell>{resourceType ? intl[resourceType] : "-"}</Table.DataCell>
    </Table.Row>
  );
}
