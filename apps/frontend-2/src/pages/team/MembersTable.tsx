import type { SortState } from "@navikt/ds-react";
import { Table } from "@navikt/ds-react";
import capitalize from "lodash/capitalize";
import sortBy from "lodash/sortBy";
import { useState } from "react";
import { Link } from "react-router-dom";

import { UserImage } from "../../components/UserImage";
import type {Member, SimpleResource} from "../../constants";
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

  const membersAsRowViewMembers = createMemberRowViewData(members);
  const sortedMembers = sort ? sortMembers({ members: membersAsRowViewMembers, sort }) : membersAsRowViewMembers;

  if (members.length === 0) {
    return <p>Ingen medlemmer i teamet.</p>;
  }
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
          <Table.ColumnHeader sortKey="resourceType" sortable>
            Type
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedMembers.map((member) => (
          <MemberRow key={member.navIdent} member={member} />
        ))}
      </Table.Body>
    </Table>
  );
}

function sortMembers({ members, sort }: { members: ReturnType<typeof createMemberRowViewData>; sort: SortState }) {
  const { orderBy, direction } = sort;

  const sortedMembersAscending = sortBy(members, orderBy);
  const reversed = direction === "descending";

  return reversed ? sortedMembersAscending.reverse() : sortedMembersAscending;
}

function createMemberRowViewData(members: Member[]) {
  const teamQuery = useAllTeams({});
  const productAreaQuery = useAllProductAreas({});
  const clusterQuery = useAllClusters({});
  return members.map((member) => {
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

    return {
      navIdent: member.navIdent,
      name: member.resource.givenName,
      team,
      teamName: team?.name,
      productArea,
      productAreaName: productArea?.name,
      cluster,
      clusterName: cluster?.name,
      role: member.roles.map((role) => intl[role]).join(", "),
      description: capitalize(member.description),
      resourceType: resourceType ? intl[resourceType] : "-",
    };
  });
}

function MemberRow({ member }: { member: ReturnType<typeof createMemberRowViewData>[0] }) {
  const { navIdent, name, team, productArea, cluster, role, description, resourceType } = member;
  const res : SimpleResource = {
    navIdent,
    fullName: member.name || navIdent
  }
  return (
    <Table.Row key={navIdent}>
      <Table.DataCell>
        <UserImage resource={res} size="32px" />
      </Table.DataCell>
      <Table.DataCell>
        <Link to={`/resource/${navIdent}`}>{name}</Link>
      </Table.DataCell>
      <Table.DataCell>{team ? <Link to={`/team/${team.id}`}>{team.name}</Link> : "-"}</Table.DataCell>
      <Table.DataCell>
        {productArea ? <Link to={`/area/${productArea.id}`}>{productArea.name}</Link> : "-"}
      </Table.DataCell>
      <Table.DataCell>{cluster ? <Link to={`/cluster/${cluster.id}`}>{cluster.name}</Link> : "-"}</Table.DataCell>
      <Table.DataCell>{role}</Table.DataCell>
      <Table.DataCell>{description || "-"}</Table.DataCell>
      <Table.DataCell>{resourceType}</Table.DataCell>
    </Table.Row>
  );
}
