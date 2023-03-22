import { css } from "@emotion/css";
import type { SortState } from "@navikt/ds-react";
import { Pagination, Table } from "@navikt/ds-react";
import capitalize from "lodash/capitalize";
import sortBy from "lodash/sortBy";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

import { UserImage } from "../../components/UserImage";
import type { Member, SimpleResource } from "../../constants";
import type { TeamRole } from "../../constants";
import { useAllClusters } from "../../hooks";
import { useAllProductAreas } from "../../hooks";
import { useAllTeams } from "../../hooks";
import { intl } from "../../util/intl/intl";

const HeaderGenerator = (properties: { members: Member[]; role?: TeamRole; leaderIdent?: string }) => {
  const { role, leaderIdent, members } = properties;
  if (role) {
    return (
      <h1>
        Medlemmer - Rolle: {intl[role]} ({members.length})
      </h1>
    );
  } else if (leaderIdent) {
    return <h1>kommer snart</h1>;
  }
  return <h1>Medlemmer ({members.length})</h1>;
};
export function MembersTable({
  members,
  role,
  leaderIdent,
}: {
  members: Member[];
  role?: TeamRole;
  leaderIdent?: string;
}) {
  const [sort, setSort] = useState<SortState | undefined>(undefined);
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

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
  if (role) {
    members = members.filter((member) => member.roles.includes(role));
  }

  const membersAsRowViewMembers = createMemberRowViewData(members);
  const sortedMembers = sort ? sortMembers({ members: membersAsRowViewMembers, sort }) : membersAsRowViewMembers;
  const sortedMembersSliced = sortedMembers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (members.length === 0) {
    return <p>Ingen medlemmer i teamet.</p>;
  }
  return (
    <Fragment>
      <HeaderGenerator leaderIdent={leaderIdent} members={members} role={role} />
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
          {sortedMembersSliced.map((member) => (
            <MemberRow key={member.navIdent} member={member} />
          ))}
        </Table.Body>
      </Table>
      <div
        className={css`
          margin-top: 1em;
          display: flex;
          justify-content: center;
        `}
      >
        <Pagination
          count={Math.ceil(sortedMembers.length / rowsPerPage)}
          onPageChange={setPage}
          page={page}
          size="medium"
        />
      </div>
    </Fragment>
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
      name: member.resource.fullName,
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

  const resource: SimpleResource = {
    navIdent,
    fullName: name || navIdent,
  };
  return (
    <Table.Row key={navIdent}>
      <Table.DataCell>
        <UserImage resource={resource} size="32px" />
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
